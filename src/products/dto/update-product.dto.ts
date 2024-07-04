import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// Esta linea convierte en Opcional todas las propiedades del CreateProductDto.
 // Para que puedan ser manipuladas en la actualizacion de un registro a DB.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
