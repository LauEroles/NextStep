import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SeniorityService } from './seniority.service';
import { Seniority } from './entities/seniority.entity';
import { CreateSeniorityDto } from './dto/create-seniority.dto';

describe('SeniorityService', () => {
  let service: SeniorityService;
  let mockSeniorityRepository: MockProxy<Repository<Seniority>>;

  const seniorityMock = mock<Seniority>({
    id: 1,
    name: 'junior',
    jobOffers: [],
  });

  const seniorityMock2 = mock<Seniority>({
    id: 2,
    name: 'senior',
    jobOffers: [],
  });

  beforeAll(async () => {
    mockSeniorityRepository = mock<Repository<Seniority>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeniorityService,
        {
          provide: getRepositoryToken(Seniority),
          useValue: mockSeniorityRepository,
        },
      ],
    }).compile();

    service = module.get<SeniorityService>(SeniorityService);
  }, 30000);

  afterEach(() => {
    mockSeniorityRepository.findOneBy.mockReset();
    mockSeniorityRepository.find.mockReset();
    mockSeniorityRepository.create.mockReset();
    mockSeniorityRepository.save.mockReset();
  });


  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una seniority correctamente', async () => {
      const createSeniorityDtoMock = mock<CreateSeniorityDto>({
        name: 'Junior',
      });

      mockSeniorityRepository.findOneBy.mockResolvedValue(null);
      mockSeniorityRepository.create.mockReturnValue(seniorityMock);
      mockSeniorityRepository.save.mockResolvedValue(seniorityMock);

      const result = await service.create(createSeniorityDtoMock);

      expect(mockSeniorityRepository.create).toHaveBeenCalledWith({
        name: 'junior',
      });
      expect(mockSeniorityRepository.save).toHaveBeenCalledWith(seniorityMock);
      expect(result).toEqual(seniorityMock);
    });

    it('debería convertir el nombre a minúsculas antes de guardar', async () => {
      const createSeniorityDtoMock = mock<CreateSeniorityDto>({
        name: 'SENIOR',
      });

      mockSeniorityRepository.findOneBy.mockResolvedValue(null);
      mockSeniorityRepository.create.mockReturnValue(seniorityMock2);
      mockSeniorityRepository.save.mockResolvedValue(seniorityMock2);

      await service.create(createSeniorityDtoMock);

      expect(mockSeniorityRepository.findOneBy).toHaveBeenCalledWith({
        name: 'senior',
      });
      expect(mockSeniorityRepository.create).toHaveBeenCalledWith({
        name: 'senior',
      });
    });

    it('debería lanzar ConflictException si la seniority ya existe', async () => {
      const createSeniorityDtoMock = mock<CreateSeniorityDto>({
        name: 'junior',
      });

      mockSeniorityRepository.findOneBy.mockResolvedValue(seniorityMock);

      await expect(service.create(createSeniorityDtoMock))
        .rejects
        .toThrow(ConflictException);

      await expect(service.create(createSeniorityDtoMock))
        .rejects
        .toThrow('Esa seniority ya existe en el sistema');

      expect(mockSeniorityRepository.create).not.toHaveBeenCalled();
      expect(mockSeniorityRepository.save).not.toHaveBeenCalled();
    });

    it('debería verificar si la seniority existe con el nombre en minúsculas', async () => {
      const createSeniorityDtoMock = mock<CreateSeniorityDto>({
        name: 'JUNIOR',
      });

      mockSeniorityRepository.findOneBy.mockResolvedValue(seniorityMock);

      await expect(service.create(createSeniorityDtoMock))
        .rejects
        .toThrow(ConflictException);

      expect(mockSeniorityRepository.findOneBy).toHaveBeenCalledWith({
        name: 'junior',
      });
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las seniorities', async () => {
      const senioritiesMock = [seniorityMock, seniorityMock2];
      mockSeniorityRepository.find.mockResolvedValue(senioritiesMock);

      const result = await service.findAll();

      expect(mockSeniorityRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result).toEqual(senioritiesMock);
    });

    it('debería retornar un array vacío si no hay seniorities', async () => {
      mockSeniorityRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debería retornar una seniority por id', async () => {
      mockSeniorityRepository.findOneBy.mockResolvedValue(seniorityMock);

      const result = await service.findOne(1);

      expect(mockSeniorityRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(seniorityMock);
    });

    it('debería lanzar NotFoundException si la seniority no existe', async () => {
      mockSeniorityRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('La seniority con id #99 no existe');
    });
  });


  describe('findByName', () => {
    it('debería retornar una seniority por nombre', async () => {
      mockSeniorityRepository.findOneBy.mockResolvedValue(seniorityMock);

      const result = await service.findByName('junior');

      expect(mockSeniorityRepository.findOneBy).toHaveBeenCalledWith({
        name: 'junior',
      });
      expect(result).toEqual(seniorityMock);
    });

    it('debería convertir el nombre a minúsculas antes de buscar', async () => {
      mockSeniorityRepository.findOneBy.mockResolvedValue(seniorityMock);

      await service.findByName('JUNIOR');

      expect(mockSeniorityRepository.findOneBy).toHaveBeenCalledWith({
        name: 'junior',
      });
    });

    it('debería lanzar NotFoundException si la seniority no existe por nombre', async () => {
      mockSeniorityRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByName('trainee'))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findByName('trainee'))
        .rejects
        .toThrow("La seniority 'trainee' no existe en la base de datos");
    });

    it('debería lanzar NotFoundException con el nombre exacto en el mensaje', async () => {
      mockSeniorityRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByName('staff'))
        .rejects
        .toThrow("La seniority 'staff' no existe en la base de datos");
    });
  });
});