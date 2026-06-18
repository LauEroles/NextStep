import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JobOffer } from './entities/job-offer.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import { User } from '../users/entities/user.entity';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let mockJobOfferRepository: MockProxy<Repository<JobOffer>>;

  // ✅ Mocks reutilizables
  const seniorityMock = mock<Seniority>({
    id: 1,
    name: 'junior',
    jobOffers: [],
  });

  const recruiterMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isActive: true,
  });

  const jobOfferMock = mock<JobOffer>({
    id: 1,
    title: 'Frontend Developer',
    description: 'Buscamos un desarrollador frontend con experiencia en React.',
    seniority: seniorityMock,
    recruiter: recruiterMock,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const jobOfferMock2 = mock<JobOffer>({
    id: 2,
    title: 'Backend Developer',
    description: 'Buscamos un desarrollador backend con experiencia en NestJS.',
    seniority: seniorityMock,
    recruiter: recruiterMock,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeAll(async () => {
    mockJobOfferRepository = mock<Repository<JobOffer>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: getRepositoryToken(JobOffer),
          useValue: mockJobOfferRepository,
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
  }, 30000);

  afterEach(() => {
    mockJobOfferRepository.findOne.mockReset();
    mockJobOfferRepository.find.mockReset();
    mockJobOfferRepository.create.mockReset();
    mockJobOfferRepository.save.mockReset();
    mockJobOfferRepository.merge.mockReset();
    mockJobOfferRepository.remove.mockReset();
  });


  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una oferta de trabajo correctamente', async () => {
      const createJobOfferDtoMock = mock<CreateJobOfferDto>({
        title: 'Frontend Developer',
        description: 'Buscamos un desarrollador frontend con experiencia en React.',
        seniorityId: 1,
      });

      mockJobOfferRepository.create.mockReturnValue(jobOfferMock);
      mockJobOfferRepository.save.mockResolvedValue(jobOfferMock);

      const result = await service.create(createJobOfferDtoMock, 1);

      expect(mockJobOfferRepository.create).toHaveBeenCalledWith({
        title: 'Frontend Developer',
        description: 'Buscamos un desarrollador frontend con experiencia en React.',
        seniority: { id: 1 },
        recruiter: { id: 1 },
      });
      expect(mockJobOfferRepository.save).toHaveBeenCalledWith(jobOfferMock);
      expect(result).toEqual(jobOfferMock);
    });

    it('debería separar el seniorityId del resto de los datos', async () => {
      const createJobOfferDtoMock = mock<CreateJobOfferDto>({
        title: 'Backend Developer',
        description: 'Buscamos un desarrollador backend.',
        seniorityId: 2,
      });

      mockJobOfferRepository.create.mockReturnValue(jobOfferMock2);
      mockJobOfferRepository.save.mockResolvedValue(jobOfferMock2);

      await service.create(createJobOfferDtoMock, 1);

      expect(mockJobOfferRepository.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ seniorityId: 2 }),
      );
      expect(mockJobOfferRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ seniority: { id: 2 } }),
      );
    });

    it('debería asignar el recruiterId correctamente', async () => {
      const createJobOfferDtoMock = mock<CreateJobOfferDto>({
        title: 'Frontend Developer',
        description: 'Descripción de prueba.',
        seniorityId: 1,
      });

      mockJobOfferRepository.create.mockReturnValue(jobOfferMock);
      mockJobOfferRepository.save.mockResolvedValue(jobOfferMock);

      await service.create(createJobOfferDtoMock, 5);

      expect(mockJobOfferRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ recruiter: { id: 5 } }),
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las ofertas con sus relaciones', async () => {
      const jobOffersMock = [jobOfferMock, jobOfferMock2];
      mockJobOfferRepository.find.mockResolvedValue(jobOffersMock);

      const result = await service.findAll();

      expect(mockJobOfferRepository.find).toHaveBeenCalledWith({
        relations: ['seniority', 'recruiter'],
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(jobOffersMock);
    });

    it('debería retornar un array vacío si no hay ofertas', async () => {
      mockJobOfferRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debería retornar una oferta por id sin relaciones', async () => {
      mockJobOfferRepository.findOne.mockResolvedValue(jobOfferMock);

      const result = await service.findOne(1);

      expect(mockJobOfferRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [],
      });
      expect(result).toEqual(jobOfferMock);
    });

    it('debería retornar una oferta por id con relaciones', async () => {
      mockJobOfferRepository.findOne.mockResolvedValue(jobOfferMock);

      const result = await service.findOne(1, ['seniority', 'recruiter']);

      expect(mockJobOfferRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['seniority', 'recruiter'],
      });
      expect(result).toEqual(jobOfferMock);
    });

    it('debería lanzar NotFoundException si la oferta no existe', async () => {
      mockJobOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('No se encontró la oferta.');
    });
  });


  describe('update', () => {
    it('debería actualizar una oferta correctamente', async () => {
      const updateJobOfferDtoMock = mock<UpdateJobOfferDto>({
        title: 'Senior Frontend Developer',
        isActive: false,
      });

      const updatedJobOfferMock = mock<JobOffer>({
        ...jobOfferMock,
        title: 'Senior Frontend Developer',
        isActive: false,
      });

      mockJobOfferRepository.findOne.mockResolvedValue(jobOfferMock);
      mockJobOfferRepository.merge.mockReturnValue(updatedJobOfferMock);
      mockJobOfferRepository.save.mockResolvedValue(updatedJobOfferMock);

      const result = await service.update(1, updateJobOfferDtoMock);

      expect(mockJobOfferRepository.merge).toHaveBeenCalledWith(
        jobOfferMock,
        expect.not.objectContaining({ seniorityId: expect.anything() }),
      );
      expect(mockJobOfferRepository.save).toHaveBeenCalledWith(updatedJobOfferMock);
      expect(result).toEqual(updatedJobOfferMock);
    });

    it('debería actualizar el seniority si se envía seniorityId', async () => {
      const updateJobOfferDtoMock = mock<UpdateJobOfferDto>({
        seniorityId: 2,
      });

      const updatedJobOfferMock = mock<JobOffer>({
        ...jobOfferMock,
        seniority: { id: 2 } as Seniority,
      });

      mockJobOfferRepository.findOne.mockResolvedValue(jobOfferMock);
      mockJobOfferRepository.merge.mockReturnValue(updatedJobOfferMock);
      mockJobOfferRepository.save.mockResolvedValue(updatedJobOfferMock);

      const result = await service.update(1, updateJobOfferDtoMock);

      expect(result.seniority).toEqual({ id: 2 });
    });

    it('no debería actualizar el seniority si no se envía seniorityId', async () => {
      const updateJobOfferDtoMock = mock<UpdateJobOfferDto>({
        title: 'Updated Title',
        seniorityId: undefined,
      });

      const updatedJobOfferMock = mock<JobOffer>({ ...jobOfferMock });

      mockJobOfferRepository.findOne.mockResolvedValue(jobOfferMock);
      mockJobOfferRepository.merge.mockReturnValue(updatedJobOfferMock);
      mockJobOfferRepository.save.mockResolvedValue(updatedJobOfferMock);

      const result = await service.update(1, updateJobOfferDtoMock);

      expect(result.seniority).toEqual(seniorityMock);
    });

    it('debería lanzar NotFoundException si la oferta a actualizar no existe', async () => {
      mockJobOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateJobOfferDto>()))
        .rejects
        .toThrow(NotFoundException);

      expect(mockJobOfferRepository.save).not.toHaveBeenCalled();
    });
  });


  describe('remove', () => {
    it('debería eliminar una oferta correctamente', async () => {
      mockJobOfferRepository.findOne.mockResolvedValue(jobOfferMock);
      mockJobOfferRepository.remove.mockResolvedValue(jobOfferMock);

      const result = await service.remove(1);

      expect(mockJobOfferRepository.remove).toHaveBeenCalledWith(jobOfferMock);
      expect(result).toEqual({ message: 'Oferta #1 eliminada correctamente.' });
    });

    it('debería lanzar NotFoundException si la oferta a eliminar no existe', async () => {
      mockJobOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99))
        .rejects
        .toThrow(NotFoundException);

      expect(mockJobOfferRepository.remove).not.toHaveBeenCalled();
    });
  });
});
