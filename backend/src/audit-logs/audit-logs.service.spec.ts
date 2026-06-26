import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let mockAuditLogRepository: MockProxy<Repository<AuditLog>>;

  const userMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isActive: true,
  });

  const auditLogMock = mock<AuditLog>({
    id: 1,
    user: userMock,
    action: 'CREATE',
    entity: 'JobOffer',
    entityId: 10,
    createdAt: new Date(),
  });

  const auditLogMock2 = mock<AuditLog>({
    id: 2,
    user: userMock,
    action: 'DELETE',
    entity: 'User',
    entityId: 5,
    createdAt: new Date(),
  });

  beforeAll(async () => {
    mockAuditLogRepository = mock<Repository<AuditLog>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
  }, 30000);

  afterEach(() => {
    mockAuditLogRepository.findOneBy.mockReset();
    mockAuditLogRepository.find.mockReset();
    mockAuditLogRepository.create.mockReset();
    mockAuditLogRepository.save.mockReset();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('debería crear un log correctamente con userId definido', async () => {
      const createAuditLogDtoMock: CreateAuditLogDto = {
        userId: 1,
        action: 'CREATE',
        entity: 'JobOffer',
        entityId: 10,
      };

      mockAuditLogRepository.create.mockReturnValue(auditLogMock);
      mockAuditLogRepository.save.mockResolvedValue(auditLogMock);

      const result = await service.create(createAuditLogDtoMock);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        action: 'CREATE',
        entity: 'JobOffer',
        entityId: 10,
        user: { id: 1 },
      });
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(auditLogMock);
      expect(result).toEqual(auditLogMock);
    });

    it('debería crear un log con user en null si userId es null', async () => {
      const createAuditLogDtoMock: CreateAuditLogDto = {
        userId: null,
        action: 'DELETE',
        entity: 'System',
        entityId: null,
      };

      const systemLogMock = mock<AuditLog>({
        id: 3,
        user: undefined,
        action: 'DELETE',
        entity: 'System',
        entityId: null,
        createdAt: new Date(),
      });

      mockAuditLogRepository.create.mockReturnValue(systemLogMock);
      mockAuditLogRepository.save.mockResolvedValue(systemLogMock);

      const result = await service.create(createAuditLogDtoMock);

      // ✅ Verificar que user se pasa como null cuando userId es null
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        action: 'DELETE',
        entity: 'System',
        entityId: null,
        user: null,
      });
      expect(result).toEqual(systemLogMock);
    });

    it('no debería incluir userId directamente en el objeto pasado a create', async () => {
      const createAuditLogDtoMock: CreateAuditLogDto = {
        userId: 5,
        action: 'UPDATE',
        entity: 'Role',
        entityId: 2,
      };

      mockAuditLogRepository.create.mockReturnValue(auditLogMock);
      mockAuditLogRepository.save.mockResolvedValue(auditLogMock);

      await service.create(createAuditLogDtoMock);

      const createCall = mockAuditLogRepository.create.mock.calls[0][0];
      expect(createCall).not.toHaveProperty('userId');
      expect(createCall).toHaveProperty('user', { id: 5 });
    });

    it('debería crear logs con distintas acciones', async () => {
      const actions = ['CREATE', 'UPDATE', 'DELETE'];

      for (const action of actions) {
        const createAuditLogDtoMock: CreateAuditLogDto = {
          userId: 1,
          action,
          entity: 'JobOffer',
          entityId: 1,
        };

        mockAuditLogRepository.create.mockReturnValue(auditLogMock);
        mockAuditLogRepository.save.mockResolvedValue(auditLogMock);

        await service.create(createAuditLogDtoMock);

        expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ action }),
        );

        mockAuditLogRepository.create.mockReset();
        mockAuditLogRepository.save.mockReset();
      }
    });

    it('debería crear logs para distintas entidades', async () => {
      const entities = ['JobOffer', 'User', 'Role', 'Stage'];

      for (const entity of entities) {
        const createAuditLogDtoMock: CreateAuditLogDto = {
          userId: 1,
          action: 'CREATE',
          entity,
          entityId: 1,
        };

        mockAuditLogRepository.create.mockReturnValue(auditLogMock);
        mockAuditLogRepository.save.mockResolvedValue(auditLogMock);

        await service.create(createAuditLogDtoMock);

        expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ entity }),
        );

        mockAuditLogRepository.create.mockReset();
        mockAuditLogRepository.save.mockReset();
      }
    });

    it('debería crear un log con entityId en null', async () => {
      const createAuditLogDtoMock: CreateAuditLogDto = {
        userId: 1,
        action: 'LOGIN',
        entity: 'Auth',
        entityId: null,
      };

      const loginLogMock = mock<AuditLog>({
        id: 4,
        user: userMock,
        action: 'LOGIN',
        entity: 'Auth',
        entityId: null,
        createdAt: new Date(),
      });

      mockAuditLogRepository.create.mockReturnValue(loginLogMock);
      mockAuditLogRepository.save.mockResolvedValue(loginLogMock);

      const result = await service.create(createAuditLogDtoMock);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ entityId: null }),
      );
      expect(result.entityId).toBeNull();
    });
  });


  describe('findAll', () => {
    it('debería retornar todos los logs con la relación user', async () => {
      const auditLogsMock = [auditLogMock, auditLogMock2];
      mockAuditLogRepository.find.mockResolvedValue(auditLogsMock);

      const result = await service.findAll();

      expect(mockAuditLogRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(auditLogsMock);
    });

    it('debería retornar array vacío si no hay logs', async () => {
      mockAuditLogRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería retornar un solo log si solo hay uno', async () => {
      mockAuditLogRepository.find.mockResolvedValue([auditLogMock]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(auditLogMock);
    });
  });


  describe('findOne', () => {
    it('debería retornar un log por id', async () => {
      mockAuditLogRepository.findOneBy.mockResolvedValue(auditLogMock);

      const result = await service.findOne(1);

      expect(mockAuditLogRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(auditLogMock);
    });

    it('debería retornar el log con todos sus campos', async () => {
      mockAuditLogRepository.findOneBy.mockResolvedValue(auditLogMock);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.action).toBe('CREATE');
      expect(result.entity).toBe('JobOffer');
      expect(result.entityId).toBe(10);
    });

    it('debería lanzar NotFoundException si el log no existe', async () => {
      mockAuditLogRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('El log con el id #99 no existe');
    });

    it('debería buscar con el id correcto', async () => {
      mockAuditLogRepository.findOneBy.mockResolvedValue(auditLogMock2);

      await service.findOne(2);

      expect(mockAuditLogRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    });
  });
});
