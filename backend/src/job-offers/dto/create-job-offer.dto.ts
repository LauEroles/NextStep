import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { Seniority } from '../enums/seniority.enum';
import { JobOfferStatus } from '../enums/job-offers.enum';


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

  @IsString({ message: 'Las skills deben ser un texto válido' })
  @IsNotEmpty({ message: 'Las skills requeridas son obligatorias' })
  @MaxLength(500, { message: 'Las skills no pueden tener más de 500 caracteres' })
  skills_required: string;

  @IsEnum(JobOfferStatus, { message: 'El estado especificado no es válido' })
  @IsOptional()
  status?: JobOfferStatus;

  @IsNumber({}, { message: 'El recruiter_id debe ser un número' })
  @IsNotEmpty({ message: 'El recruiter_id es obligatorio' })
  recruiter_id: number;
}


