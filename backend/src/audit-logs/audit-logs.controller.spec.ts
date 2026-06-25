import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let mockAuditLogsService: MockProxy<AuditLogsService>;

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
    mockAuditLogsService = mock<AuditLogsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debería llamar a auditLogsService.findAll', async () => {
      const auditLogsMock = [auditLogMock, auditLogMock2];
      mockAuditLogsService.findAll.mockResolvedValue(auditLogsMock);

      const result = await controller.findAll();

      expect(mockAuditLogsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(auditLogsMock);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío si no hay logs', async () => {
      mockAuditLogsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería llamar a auditLogsService.findOne con el id correcto', async () => {
      mockAuditLogsService.findOne.mockResolvedValue(auditLogMock);

      const result = await controller.findOne('1');

      expect(mockAuditLogsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(auditLogMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockAuditLogsService.findOne.mockResolvedValue(auditLogMock2);

      await controller.findOne('2');

      expect(mockAuditLogsService.findOne).toHaveBeenCalledWith(2);
    });

    it('debería propagar NotFoundException si el log no existe', async () => {
      mockAuditLogsService.findOne.mockRejectedValue(
        new NotFoundException('El log con el id #99 no existe'),
      );

      await expect(controller.findOne('99'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
