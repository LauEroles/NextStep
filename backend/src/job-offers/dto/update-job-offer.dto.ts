import { PartialType } from '@nestjs/mapped-types';
import { CreateJobOfferDto } from './create-job-offer.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {
  @IsOptional()
  @IsBoolean({ message: 'El campo isActive debe ser verdadero o falso' })
  isActive?: boolean;
}
