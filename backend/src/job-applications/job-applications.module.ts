import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplication } from './entities/job-application.entity';
import { UsersModule } from '../users/users.module';
import { JobOffersModule } from '../job-offers/job-offers.module';
import { StagesModule } from '../stages/stages.module';
import {Feedback} from '../feedback/entities/feedback.entity';
import { ApplicationFactory } from './factories/application.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Feedback]),
    UsersModule,
    JobOffersModule,
    StagesModule,
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService, ApplicationFactory],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
