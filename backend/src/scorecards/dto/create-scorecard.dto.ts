import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateScorecardDto {
  @IsInt({ message: 'El feedback_id debe ser un número entero' })
  @IsNotEmpty({ message: 'El feedback_id es obligatorio' })
  feedbackId: number;

  @IsString({ message: 'El nombre del skill debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del skill es obligatorio' })
  @MaxLength(100, { message: 'El nombre del skill no puede exceder 100 caracteres' })
  skillName: string;

  @IsInt({ message: 'El puntaje debe ser un número entero' })
  @IsNotEmpty({ message: 'El puntaje es obligatorio' })
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @Max(5, { message: 'El puntaje máximo es 5' })
  score: number;

  @IsEnum(['technical', 'soft'], { message: 'El tipo debe ser technical o soft' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  type: 'technical' | 'soft';
}