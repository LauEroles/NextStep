import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleRepository: MockProxy<Repository<Role>>;

  // ✅ Mocks reutilizables
  const roleMock = mock<Role>({
    id: 1,
    name: 'applicant',
    isDefault: true,
    users: [],
  });

  const roleMock2 = mock<Role>({
    id: 2,
    name: 'recruiter',
    isDefault: false,
    users: [],
  });

  beforeAll(async () => {
    mockRoleRepository = mock<Repository<Role>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  }, 30000);

  afterEach(() => {
    mockRoleRepository.findOneBy.mockReset();
    mockRoleRepository.find.mockReset();
    mockRoleRepository.create.mockReset();
    mockRoleRepository.save.mockReset();
  });


  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('debería crear un rol ', async () => {
      const createRoleDtoMock = mock<CreateRoleDto>({
        name: 'Applicant',
      });

      mockRoleRepository.findOneBy.mockResolvedValue(null);
      mockRoleRepository.create.mockReturnValue(roleMock);
      mockRoleRepository.save.mockResolvedValue(roleMock);

      const result = await service.create(createRoleDtoMock);

      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'applicant',
      });
      expect(mockRoleRepository.save).toHaveBeenCalledWith(roleMock);
      expect(result).toEqual(roleMock);
    });

    it('debería convertir el nombre a minúsculas antes de guardar', async () => {
      const createRoleDtoMock = mock<CreateRoleDto>({
        name: 'RECRUITER',
      });

      mockRoleRepository.findOneBy.mockResolvedValue(null);
      mockRoleRepository.create.mockReturnValue(roleMock2);
      mockRoleRepository.save.mockResolvedValue(roleMock2);

      await service.create(createRoleDtoMock);

      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
        name: 'recruiter',
      });
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'recruiter',
      });
    });

    it('debería lanzar ConflictException si el rol ya existe', async () => {
      const createRoleDtoMock = mock<CreateRoleDto>({
        name: 'applicant',
      });

      mockRoleRepository.findOneBy.mockResolvedValue(roleMock);

      await expect(service.create(createRoleDtoMock))
        .rejects
        .toThrow(ConflictException);

      await expect(service.create(createRoleDtoMock))
        .rejects
        .toThrow('Ese rol ya existe en el sistema');

      expect(mockRoleRepository.create).not.toHaveBeenCalled();
      expect(mockRoleRepository.save).not.toHaveBeenCalled();
    });

    it('debería verificar si el rol existe con el nombre en minúsculas', async () => {
      const createRoleDtoMock = mock<CreateRoleDto>({
        name: 'APPLICANT',
      });

      mockRoleRepository.findOneBy.mockResolvedValue(roleMock);

      await expect(service.create(createRoleDtoMock))
        .rejects
        .toThrow(ConflictException);

      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
        name: 'applicant',
      });
    });
  });


  describe('findAll', () => {
    it('debería retornar todos los roles', async () => {
      const rolesMock = [roleMock, roleMock2];
      mockRoleRepository.find.mockResolvedValue(rolesMock);

      const result = await service.findAll();

      expect(mockRoleRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result).toEqual(rolesMock);
    });

    it('debería retornar un array vacío si no hay roles', async () => {
      mockRoleRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debería retornar un rol por id', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(roleMock);

      const result = await service.findOne(1);

      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(roleMock);
    });

    it('debería lanzar NotFoundException si el rol no existe', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('El rol con id #99 no existe');
    });
  });


  describe('findByName', () => {
    it('debería retornar un rol por nombre', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(roleMock);

      const result = await service.findByName('applicant');

      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
        name: 'applicant',
      });
      expect(result).toEqual(roleMock);
    });

    it('debería convertir el nombre a minúsculas antes de buscar', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(roleMock);

      await service.findByName('APPLICANT');

      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
        name: 'applicant',
      });
    });

    it('debería lanzar NotFoundException si el rol no existe por nombre', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByName('admin'))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findByName('admin'))
        .rejects
        .toThrow("El rol 'admin' no existe en la base de datos");
    });

    it('debería lanzar NotFoundException con el nombre exacto en el mensaje', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByName('superadmin'))
        .rejects
        .toThrow("El rol 'superadmin' no existe en la base de datos");
    });
  });

  describe('findDefaultRole', () => {
    it('debería retornar el rol por defecto', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(roleMock);

      const result = await service.findDefaultRole();

      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({
        isDefault: true,
      });
      expect(result).toEqual(roleMock);
      expect(result.isDefault).toBe(true);
    });

    it('debería lanzar InternalServerErrorException si no hay rol por defecto', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findDefaultRole())
        .rejects
        .toThrow(InternalServerErrorException);

      await expect(service.findDefaultRole())
        .rejects
        .toThrow('Error crítico: No hay un rol por defecto configurado en el sistema');
    });
  });
});