import { IsEnum, IsOptional } from 'class-validator';
import { JobApplicationStage } from '../enums/job-application-stage.enum';

export class UpdateJobApplicationDto {
  @IsOptional()
  @IsEnum(JobApplicationStage, {
    message: 'El estado ingresado no es una etapa válida del proceso.',
  })
  status?: JobApplicationStage;
}
