import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { Seniority } from '../enums/seniority.enum';

export class CreateJobOfferDto {
  @IsString({ message: 'El título debe ser un texto válido' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título no puede tener más de 255 caracteres' })
  title: string;

  @IsString({ message: 'La descripción debe ser un texto válido' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @IsEnum(Seniority, { message: 'El seniority especificado no es válido' })
  @IsNotEmpty({ message: 'El seniority es obligatorio' })
  seniority: Seniority;
}
