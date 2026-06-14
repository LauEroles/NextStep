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


@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    private readonly jobOffersService: JobOffersService,
    private readonly stagesService: StagesService,
    private readonly applicationFactory: ApplicationFactory,

  ) {}

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    applicantId: number,
  ) {
    const jobOffer = await this.jobOffersService.findOne(
      createJobApplicationDto.job_offer_id,
    );

    if (!jobOffer) {
      throw new NotFoundException('La oferta de trabajo no existe.');
    }

    if (!jobOffer.isActive) {
      throw new BadRequestException('Esta oferta no se encuentra activa.');
    }

    const existingApplication = await this.applicationRepo.findOne({
      where: {
        applicant: { id: applicantId },
        jobOffer: { id: jobOffer.id },
      },
    });

    if (existingApplication) {
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

  async findOne(id: number) {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: ['jobOffer', 'applicant', 'currentStage'],
    });

    if (!application) {
      throw new NotFoundException(`La postulación #${id} no fue encontrada.`);
    }

    return application;
  }

  async update(id: number, updateJobApplicationDto: UpdateJobApplicationDto) {
    const application = await this.findOne(id);

    const targetStage = await this.stagesService.findOne(
      updateJobApplicationDto.current_stage_id,
    );

    if (application.currentStage.isTerminal) {
      throw new BadRequestException(
        'No se puede cambiar la etapa de una postulación que ya ha finalizado.',
      );
    }

    application.currentStage = targetStage;
    return await this.applicationRepo.save(application);
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    return await this.applicationRepo.remove(application);
  }
}
