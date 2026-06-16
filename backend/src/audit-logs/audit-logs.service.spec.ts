@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto) {
    const newLog = this.auditLogRepository.create({
      user: { id: createAuditLogDto.userId },
      action: createAuditLogDto.action,
      entity: createAuditLogDto.entity,
      entity_id: createAuditLogDto.entity_id,
    });
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