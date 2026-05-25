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
import { UsersService } from '../users/users.service';
import { JobOffersService } from '../job-offers/job-offers.service';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    private readonly usersService: UsersService,
    private readonly jobOffersService: JobOffersService,
  ) {}

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    candidateId: number,
  ) {
    const candidate = await this.usersService.findOne(candidateId);
    if (!candidate) throw new NotFoundException('El candidato no existe.');

    const jobOffer = await this.jobOffersService.findOne(
      createJobApplicationDto.jobOffer_id,
    );
    if (!jobOffer)
      throw new NotFoundException('La oferta de trabajo no existe.');

    const existingApplication = await this.applicationRepo.findOne({
      where: { candidate_id: candidate.id, jobOffer_id: jobOffer.id },
    });

    if (existingApplication) {
      throw new BadRequestException('Ya te has postulado a esta oferta.');
    }

    const newApplication = this.applicationRepo.create({
      candidate_id: candidate.id,
      jobOffer_id: jobOffer.id,
    });

    return await this.applicationRepo.save(newApplication);
  }

  async findAll() {
    return await this.applicationRepo.find({
      relations: ['jobOffer', 'candidate'], // Añadir 'feedback'
    });
  }

  async findOne(id: number) {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: ['jobOffer', 'candidate'],
    });

    if (!application) {
      throw new NotFoundException(`La postulación #${id} no fue encontrada.`);
    }

    return application;
  }

  async update(id: number, updateJobApplicationDto: UpdateJobApplicationDto) {
    const application = await this.findOne(id);

    const updatedApplication = Object.assign(
      application,
      updateJobApplicationDto,
    );

    return await this.applicationRepo.save(updatedApplication);
  }

  async remove(id: number) {
    const application = await this.findOne(id);
    return await this.applicationRepo.remove(application);
  }
}
