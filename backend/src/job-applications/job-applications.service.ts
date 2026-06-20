import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplication } from './entities/job-application.entity';
import { JobOffersService } from '../job-offers/job-offers.service';
import { StagesService } from '../stages/stages.service';
import { ApplicationFactory } from './factories/application.factory';
import { Feedback } from '../feedback/entities/feedback.entity';

@Injectable()
export class JobApplicationsService {
  
  constructor(
  
  @InjectRepository(JobApplication)
  private readonly applicationRepo: Repository<JobApplication>,

  @InjectRepository(Feedback)
  private readonly feedbackRepo: Repository<Feedback>,
  private readonly jobOffersService: JobOffersService,
  private readonly stagesService: StagesService,
  private readonly applicationFactory: ApplicationFactory,
) {}


  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    applicantId: number,
  ) {
    const { jobOfferId, ...applicationData } = createJobApplicationDto;

    const jobOffer = await this.jobOffersService.findOne(jobOfferId);
    if (!jobOffer) {
      throw new NotFoundException('La oferta de trabajo no existe.');
    }
    if (!jobOffer.isActive) {
      throw new BadRequestException('Esta oferta no se encuentra activa.');
    }
    if (await this.exists(applicantId, jobOfferId)) {
      throw new BadRequestException('Ya te has postulado a esta oferta.');
    }
    const initialStage = await this.stagesService.findInitialStage();
    const allStages = await this.stagesService.findAll();

    return await this.applicationFactory.create(
      jobOffer.id,
      applicantId,
      initialStage,
      allStages,
    );
  }

  async exists(applicantId: number, jobOfferId: number) {
    const application = await this.applicationRepo.findOne({
      where: {
        applicant: { id: applicantId },
        jobOffer: { id: jobOfferId },
      },
    });
    return !!application;
  }

  async findAll() {
  return await this.applicationRepo.find({
    relations: ['jobOffer', 'applicant', 'currentStage'],
    });
  }

  async findByJobOffer(jobOfferId: number) {
  return await this.applicationRepo.find({
    where: { jobOffer: { id: jobOfferId } },
    relations: ['jobOffer', 'applicant', 'currentStage'],
  });
}

  
  async findOne(id: number, relations?: string[]) {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: relations || [],
    });
    if (!application) {
      throw new NotFoundException(`No se encontró la postulación.`);
    }
    return application;
  }

  async update(id: number, updateJobApplicationDto: UpdateJobApplicationDto) {
    const application = await this.findOne(id, ['currentStage']);

    const targetStage = await this.stagesService.findOne(
      updateJobApplicationDto.stageId,
    );
    if (application.currentStage.isTerminal) {
      throw new BadRequestException(
        'No se puede cambiar la etapa de una postulación que ya ha finalizado.',
      );
    }

    if (targetStage.isHiredStage) {
      const feedbacks = await this.feedbackRepo.find({
        where: { application: { id } },
      });

      const distinctStageIds = new Set(
        feedbacks.map((fb) => fb.stage?.id).filter(Boolean),
      );

      if (distinctStageIds.size < 2) {
        throw new BadRequestException(
          'No se puede contratar a un candidato sin al menos 2 feedbacks de etapas distintas.',
        );
      }
    }

    application.currentStage = targetStage;
    return await this.applicationRepo.save(application);
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    return await this.applicationRepo.remove(application);
  }
}
