import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// Esta linea convierte en Opcional todas las propiedades del CreateProductDto.
 // Para que puedan ser manipuladas en la actualizacion de un registro a DB.
export class UpdateProductDto extends PartialType(CreateProductDto) {
    
    @IsNumber()
    @IsPositive()
    @Type( () => Number )
    public id: number;
    
}
