import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeniorityDto } from './dto/create-seniority.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seniority } from './entities/seniority.entity';

@Injectable()
export class SeniorityService {
  constructor(
    @InjectRepository(Seniority)
    private readonly seniorityRepository: Repository<Seniority>,
  ) {}

  async create(createSeniorityDto: CreateSeniorityDto) {
    const seniorityExists = await this.seniorityRepository.findOneBy({
      name: createSeniorityDto.name.toLowerCase(),
    });
    if (seniorityExists) {
      throw new ConflictException('Esa seniority ya existe en el sistema');
    }
    const newSeniority = this.seniorityRepository.create({
      name: createSeniorityDto.name.toLowerCase(),
    });
    return await this.seniorityRepository.save(newSeniority);
  }

  async findAll() {
    return await this.seniorityRepository.find();
  }

  async findOne(id: number) {
    const seniority = await this.seniorityRepository.findOneBy({ id });
    if (!seniority) {
      throw new NotFoundException(`La seniority con id #${id} no existe`);
    }
    return seniority;
  }

  async findByName(name: string) {
    const seniority = await this.seniorityRepository.findOneBy({
      name: name.toLowerCase(),
    });
    if (!seniority) {
      throw new NotFoundException(
        `La seniority '${name}' no existe en la base de datos`,
      );
    }
    return seniority;
  }
}
