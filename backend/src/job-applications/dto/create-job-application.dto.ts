import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJobApplicationDto {
  @IsNotEmpty({ message: 'El ID de la oferta de trabajo es obligatorio.' })
  @IsNumber({}, { message: 'El ID de la oferta debe ser un número.' })
  jobOfferId: number;
}
