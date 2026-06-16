import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) { }

  async create(createAuditLogDto: CreateAuditLogDto) {
    const newLog = this.auditLogRepository.create(createAuditLogDto);
    return await this.auditLogRepository.save(newLog);
  }

  async findAll() {
    return await this.auditLogRepository.find();
  }

  async findOne(id: number) {
    const log = await this.auditLogRepository.findOneBy({ id });

    if (!log) {
      throw new NotFoundException(`El log con el id #${id} no existe`);
    }

    return log;
  }
}
