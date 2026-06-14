import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from '../entities/job-application.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Stage } from '../../stages/entities/stage.entity';

@Injectable()
export class ApplicationFactory {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
  ) {}

  async create(
    jobOfferId: number,
    applicantId: number,
    initialStage: Stage,
    allStages: Stage[],
  ): Promise<JobApplication> {
    // 1. Crear la application
    const application = this.applicationRepo.create({
      applicant: { id: applicantId },
      jobOffer: { id: jobOfferId },
      currentStage: initialStage,
    });
    const savedApplication = await this.applicationRepo.save(application);

    // 2. Crear un feedback vacío por cada stage no terminal
    const nonTerminalStages = allStages.filter(s => !s.isTerminal);
    
    for (const stage of nonTerminalStages) {
        const feedback = new Feedback();
        feedback.application = { id: savedApplication.id } as JobApplication;
        feedback.stage = { id: stage.id } as Stage;
        feedback.comment = undefined;  
        feedback.internalNotes = "";
        feedback.publicFeedback = "";

    await this.feedbackRepo.save(feedback);  
    }

    return savedApplication;
  }
}