import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScorecardsService } from './scorecards.service';
import { ScorecardsController } from './scorecards.controller';
import { Scorecard } from './entities/scorecard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scorecard])],
  controllers: [ScorecardsController],
  providers: [ScorecardsService],
  exports: [ScorecardsService],
})
export class ScorecardsModule {}