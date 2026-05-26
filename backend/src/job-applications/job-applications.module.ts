import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplication } from './entities/job-application.entity';
import { UsersModule } from '../users/users.module';
import { JobOffersModule } from '../job-offers/job-offers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication]),
    UsersModule,
    JobOffersModule,
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
