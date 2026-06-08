import { Module } from '@nestjs/common';
import { SeniorityService } from './seniority.service';
import { SeniorityController } from './seniority.controller';
import { Seniority } from './entities/seniority.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Seniority])],
  controllers: [SeniorityController],
  providers: [SeniorityService],
  exports: [SeniorityService],
})
export class SeniorityModule {}
