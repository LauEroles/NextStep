import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, recruiterId: number) {
    const feedback = this.feedbackRepository.create({
      comment: createFeedbackDto.comment,
      technicalScore: createFeedbackDto.technicalScore,
      softSkillsScore: createFeedbackDto.softSkillsScore,
      application: { id: createFeedbackDto.application_id },
      stage: { id: createFeedbackDto.stage_id },
      recruiter: { id: recruiterId },
    });
    return await this.feedbackRepository.save(feedback);
  }

  async findAll() {
    return await this.feedbackRepository.find({
      relations: ['application', 'stage', 'recruiter'],
    });
  }

  async findOne(id: number) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['application', 'stage', 'recruiter'],
    });
    if (!feedback) {
      throw new NotFoundException(`El feedback con id #${id} no existe`);
    }
    return feedback;
  }

  async update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.findOne(id);
    const updated = Object.assign(feedback, updateFeedbackDto);
    return await this.feedbackRepository.save(updated);
  }

  async remove(id: number) {
    const feedback = await this.findOne(id);
    await this.feedbackRepository.remove(feedback);
    return { message: `Feedback #${id} eliminado correctamente` };
  }
}
