import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsInt({ message: 'El application_id debe ser un número entero' })
  application_id: number;

  @IsNumber({}, { message: 'El ID de la etapa debe ser un número válido' })
  stage_id: number;

  @IsInt({ message: 'El puntaje técnico debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El puntaje mínimo es 0' })
  @Max(5, { message: 'El puntaje máximo es 5' })
  technicalScore?: number;

  @IsInt({ message: 'El puntaje soft skills debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El puntaje mínimo es 0' })
  @Max(5, { message: 'El puntaje máximo es 5' })
  softSkillsScore?: number;

  @IsString({ message: 'El comentario debe ser un texto válido' })
  @IsOptional()
  @MaxLength(1000, { message: 'El comentario no puede exceder los 1000 caracteres' })
  comment?: string;

  @IsString({ message: 'Las notas internas deben ser texto' })
  @IsOptional()
  @MaxLength(2000, { message: 'Las notas internas no pueden exceder los 2000 caracteres' })
  internalNotes?: string;

  @IsString({ message: 'El feedback público debe ser texto' })
  @IsOptional()
  @MaxLength(2000, { message: 'El feedback público no puede exceder los 2000 caracteres' })
  publicFeedback?: string;
}