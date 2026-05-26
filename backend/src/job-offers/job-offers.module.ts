import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { JobOffer } from './entities/job-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer])],
  controllers: [JobOffersController],
  providers: [JobOffersService],
  exports: [JobOffersService],
})
export class JobOffersModule {}
