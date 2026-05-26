import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsInt({ message: 'El application_id debe ser un número entero' })
  @IsNotEmpty({ message: 'El application_id es obligatorio' })
  application_id: number;

  @IsInt({ message: 'El recruiter_id debe ser un número entero' })
  @IsNotEmpty({ message: 'El recruiter_id es obligatorio' })
  recruiter_id: number;

  @IsInt({ message: 'El puntaje técnico debe ser un número entero' })
  @IsNotEmpty({ message: 'El puntaje técnico es obligatorio' })
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @Max(10, { message: 'El puntaje máximo es 10' })
  technical_score: number;

  @IsInt({ message: 'El puntaje soft skills debe ser un número entero' })
  @IsNotEmpty({ message: 'El puntaje soft skills es obligatorio' })
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @Max(10, { message: 'El puntaje máximo es 10' })
  soft_skills_score: number;

  @IsString({ message: 'El comentario debe ser un texto válido' })
  @IsOptional()
  comment?: string;
}