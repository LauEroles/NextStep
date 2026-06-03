import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
  IsNumber,
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
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @Max(10, { message: 'El puntaje máximo es 10' })
  technical_score?: number;

  @IsInt({ message: 'El puntaje soft skills debe ser un número entero' })
  @IsOptional()
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @Max(10, { message: 'El puntaje máximo es 10' })
  soft_skills_score?: number;

  @IsString({ message: 'El comentario debe ser un texto válido' })
  @IsNotEmpty({ message: 'El comentario es obligatorio' })
  comment: string;
}
