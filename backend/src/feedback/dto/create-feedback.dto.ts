import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsInt({ message: 'El application_id debe ser un número entero' })
  @IsNotEmpty({ message: 'El application_id es obligatorio' })
  application_id: number;

  @IsNumber({}, { message: 'El ID de la etapa debe ser un número válido' })
  @IsNotEmpty({ message: 'El ID de la etapa es obligatorio' })
  stage_id: number;

  @IsInt({ message: 'El puntaje técnico debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El puntaje mínimo es 0' })
  @Max(5, { message: 'El puntaje máximo es 5' })
  technical_score?: number;

  @IsInt({ message: 'El puntaje soft skills debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El puntaje mínimo es 0' })
  @Max(5, { message: 'El puntaje máximo es 5' })
  soft_skills_score?: number;

  @IsString({ message: 'El comentario debe ser un texto válido' })
  @IsNotEmpty({ message: 'El comentario es obligatorio' })
  @MaxLength(1000, { message: 'El comentario no puede exceder los 1000 caracteres' })
  comment: string;
}
