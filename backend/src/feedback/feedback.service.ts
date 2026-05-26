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

  async create(createFeedbackDto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    return await this.feedbackRepository.save(feedback);
  }

  async findAll() {
    return await this.feedbackRepository.find();
  }

  async findOne(id: number) {
    const feedback = await this.feedbackRepository.findOneBy({ id });
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