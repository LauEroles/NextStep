import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from './entities/feedback.entity';
import { JobApplicationsModule } from '../job-applications/job-applications.module';
import { StagesModule } from '../stages/stages.module';
import { ScorecardsModule } from '../scorecards/scorecards.module';   
import { CvModule } from '../cv/cv.module';                           
import { GeminiService } from './gemini.service';  

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback]),
    JobApplicationsModule,
    StagesModule,
    ScorecardsModule,
    CvModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, GeminiService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
