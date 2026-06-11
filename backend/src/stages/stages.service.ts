import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { Stage } from './entities/stage.entity';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly stageRepo: Repository<Stage>,
  ) {}

  async create(createStageDto: CreateStageDto) {
    const stage = this.stageRepo.create({
      ...createStageDto,
    });
    return await this.stageRepo.save(stage);
  }

  async findAll() {
    return await this.stageRepo.find({
      order: { sequenceOrder: 'ASC' },
    });
  }

  async findOne(id: number) {
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) {
      throw new NotFoundException(`No se encontró ninguna etapa.`);
    }
    return stage;
  }

  async findInitialStage() {
    const initialStage = await this.stageRepo.findOne({
      order: { sequenceOrder: 'ASC' },
    });
    if (!initialStage) {
      throw new NotFoundException('No se encontraron etapas.');
    }
    return initialStage;
  }

  async update(id: number, updateStageDto: UpdateStageDto) {
    const stage = await this.findOne(id);
    const updated = this.stageRepo.merge(stage, updateStageDto);
    return await this.stageRepo.save(updated);
  }

  async remove(id: number) {
    const stage = await this.findOne(id);
    return await this.stageRepo.remove(stage);
  }
}
