import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateStageDto {
  @IsNotEmpty({ message: 'El nombre de la etapa es obligatorio.' })
  @IsString({ message: 'El nombre de la etapa debe ser un texto válido.' })
  name: string;

  @IsNotEmpty({ message: 'El orden de secuencia es obligatorio.' })
  @IsInt({ message: 'El orden de secuencia debe ser un número entero.' })
  @Min(1, { message: 'El orden de secuencia mínimo debe ser 1.' })
  sequence_order: number;
}
