import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { JobOffer } from './entities/job-offer.entity';
import { Seniority } from '../seniority/entities/seniority.entity';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOffer)
    private readonly jobOfferRepository: Repository<JobOffer>,
  ) { }

  async create(createJobOfferDto: CreateJobOfferDto, recruiterId: number) {
    const { seniorityId, ...offerData } = createJobOfferDto;
    const jobOffer = this.jobOfferRepository.create({
      ...offerData,
      seniority: { id: seniorityId },
      recruiter: { id: recruiterId },
    });
    return await this.jobOfferRepository.save(jobOffer);
  }

  async findAll() {
    return await this.jobOfferRepository.find({
      relations: ['seniority', 'recruiter'],
    });
  }

  async findOne(id: number, relations?: string[]) {
    const jobOffer = await this.jobOfferRepository.findOne({
      where: { id },
      relations: relations || [],
    });
    if (!jobOffer) {
      throw new NotFoundException(`No se encontró la oferta.`);
    }
    return jobOffer;
  }

  async findByRecruiter(recruiterId: number) {
    return await this.jobOfferRepository.find({
      where: { recruiter: { id: recruiterId } },
      relations: ['seniority', 'recruiter'],
    });
  }

  async update(id: number, updateJobOfferDto: UpdateJobOfferDto) {
    const jobOffer = await this.findOne(id);
    const { seniorityId, ...updateData } = updateJobOfferDto;
    const updated = this.jobOfferRepository.merge(jobOffer, updateData);
    if (seniorityId) {
      updated.seniority = { id: seniorityId } as Seniority;
    }
    return await this.jobOfferRepository.save(updated);
  }

  async remove(id: number) {
    const jobOffer = await this.findOne(id);
    await this.jobOfferRepository.remove(jobOffer);
    return { message: `Oferta #${id} eliminada correctamente.` };
  }
}
