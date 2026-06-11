import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateJobOfferDto {
  @IsString({ message: 'El título debe ser un texto válido' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(50, { message: 'El título no puede tener más de 50 caracteres' })
  title: string;

  @IsString({ message: 'La descripción debe ser un texto válido' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000, { message: 'La descripción no puede tener más de 2000 caracteres' })
  description: string;

  @IsNumber({}, { message: 'El ID de seniority debe ser un número válido' })
  @IsNotEmpty({ message: 'El ID de seniority es obligatorio' })
  seniorityId: number;
}
