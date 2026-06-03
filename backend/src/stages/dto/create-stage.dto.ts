import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStageDto {
  @IsNotEmpty({ message: 'El nombre de la etapa es obligatorio.' })
  @IsString({ message: 'El nombre de la etapa debe ser un texto válido.' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
  name: string;

  @IsNotEmpty({ message: 'El orden de secuencia es obligatorio.' })
  @IsInt({ message: 'El orden de secuencia debe ser un número entero.' })
  @Min(1, { message: 'El orden de secuencia mínimo debe ser 1.' })
  sequence_order: number;

  @IsBoolean({ message: 'El valor debe ser verdadero o falso.' })
  is_terminal: boolean;
}
