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

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    private readonly jobOffersService: JobOffersService,
    private readonly stagesService: StagesService,
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

    const newApplication = this.applicationRepo.create({
      ...applicationData,
      applicant: { id: applicantId },
      jobOffer: jobOffer,
      currentStage: initialStage,
    });
    return await this.applicationRepo.save(newApplication);
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
    return await this.applicationRepo.find();
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
    application.currentStage = targetStage;
    return await this.applicationRepo.save(application);
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    return await this.applicationRepo.remove(application);
  }
}
