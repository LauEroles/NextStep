import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { JobOffersModule } from './job-offers/job-offers.module';

@Module({
  imports: [UsersModule, JobOffersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
