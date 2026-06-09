import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { JobOffer } from './entities/job-offer.entity';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOffer)
    private readonly jobOfferRepository: Repository<JobOffer>,
  ) {}

  async create(createJobOfferDto: CreateJobOfferDto, recruiterId: number) {
    const jobOffer = this.jobOfferRepository.create({
      ...createJobOfferDto,
      recruiter: { id: recruiterId },
    });
    return await this.jobOfferRepository.save(jobOffer);
  }

  async findAll() {
    return await this.jobOfferRepository.find();
  }

  async findOne(id: number) {
    const jobOffer = await this.jobOfferRepository.findOneBy({ id });
    if (!jobOffer) {
      throw new NotFoundException(`La oferta con id #${id} no existe`);
    }
    return jobOffer;
  }

  async update(id: number, updateJobOfferDto: UpdateJobOfferDto) {
    const jobOffer = await this.findOne(id);
    const updated = Object.assign(jobOffer, updateJobOfferDto);
    return await this.jobOfferRepository.save(updated);
  }

  async remove(id: number) {
    const jobOffer = await this.findOne(id);
    await this.jobOfferRepository.remove(jobOffer);
    return { message: `Oferta #${id} eliminada correctamente` };
  }
}
