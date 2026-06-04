import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateJobApplicationDto {
  @IsNotEmpty({ message: 'El ID de la nueva etapa es obligatorio.' })
  @IsNumber({}, { message: 'El ID de la etapa debe ser un número válido.' })
  current_stage_id: number;
}
