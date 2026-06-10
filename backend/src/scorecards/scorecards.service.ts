import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';
import { Scorecard } from './entities/scorecard.entity';

@Injectable()
export class ScorecardsService {
  constructor(
    @InjectRepository(Scorecard)
    private readonly scorecardRepository: Repository<Scorecard>,
  ) {}

  async create(createScorecardDto: CreateScorecardDto) {
    const scorecard = this.scorecardRepository.create({
      skillName: createScorecardDto.skillName,
      score: createScorecardDto.score,
      type: createScorecardDto.type,
      feedback: { id: createScorecardDto.feedbackId },
    });
    return await this.scorecardRepository.save(scorecard);
  }

  async findAll() {
    return await this.scorecardRepository.find({
      relations: ['feedback'],
    });
  }

  async findByFeedback(feedbackId: number) {
    return await this.scorecardRepository.find({
      where: { feedback: { id: feedbackId } },
    });
  }

  async findOne(id: number) {
    const scorecard = await this.scorecardRepository.findOne({
      where: { id },
      relations: ['feedback'],
    });
    if (!scorecard) {
      throw new NotFoundException(`Scorecard con id #${id} no existe`);
    }
    return scorecard;
  }

  async update(id: number, updateScorecardDto: UpdateScorecardDto) {
    const scorecard = await this.findOne(id);
    const updated = Object.assign(scorecard, updateScorecardDto);
    return await this.scorecardRepository.save(updated);
  }

  async remove(id: number) {
    const scorecard = await this.findOne(id);
    await this.scorecardRepository.remove(scorecard);
    return { message: `Scorecard #${id} eliminado correctamente` };
  }
}