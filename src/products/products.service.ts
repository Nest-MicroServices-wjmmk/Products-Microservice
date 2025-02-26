import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dtos';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    const start = Date.now();
    this.$connect();
    const end = Date.now();

    const duration = end -start;
    const reset = '\x1b[33m';
    this.logger.log(`Database Connected ${reset}+${duration}ms`)
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(pagination: PaginationDto) { 
    const { page, limit } = pagination;
    const totalPages = await this.product.count({ where: { available: true} });
    const lastPage = Math.ceil(totalPages/limit);

    return {
      metaData: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      },
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      })
    }
  }

  async findOne(id: number) {
    //const product = await this.product.findUnique({ where: {id: id} });
    const product = await this.product.findFirst({
      where: { id, available: true }
    });

    if(!product) {
      throw new RpcException({
        message:`Product with id: ➡${id}⬅ not found.`,
        status: HttpStatus.BAD_REQUEST
      });
      //throw new NotFoundException(`Product with id: ➡${id}⬅ not found.`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data
    })
  }

  async remove(id: number) {  
    const product = await this.product.update({
      where: { id }, data: {available: false } 
    })

    if(!product) {
      throw new NotFoundException(`Product with id: ➡${id}⬅ not found.`);
    }
    
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = [...new Set(ids)]; // Remove duplicates

    const products = await this.product.findMany({
      where: { id: { in: ids }, available: true }
    });

    if(products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found.',
        status: HttpStatus.BAD_REQUEST
      });
    }

    return products;
  }
}
