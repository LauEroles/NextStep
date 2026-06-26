import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { JobOffer } from './entities/job-offer.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import { User } from '../users/entities/user.entity';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let mockJobOffersService: MockProxy<JobOffersService>;

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
    description: 'Buscamos un desarrollador frontend.',
    seniority: seniorityMock,
    recruiter: recruiterMock,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const jobOfferMock2 = mock<JobOffer>({
    id: 2,
    title: 'Backend Developer',
    description: 'Buscamos un desarrollador backend.',
    seniority: seniorityMock,
    recruiter: recruiterMock,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const activeUserMock: ActiveUser = {
    id: 1,
    email: 'john@example.com',
    role: 'recruiter',
  };

  beforeAll(async () => {
    mockJobOffersService = mock<JobOffersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        {
          provide: JobOffersService,
          useValue: mockJobOffersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobOffersController>(JobOffersController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a jobOffersService.create con el DTO y el id del usuario actual', async () => {
      const createJobOfferDtoMock = mock<CreateJobOfferDto>({
        title: 'Frontend Developer',
        description: 'Buscamos un desarrollador frontend.',
        seniorityId: 1,
      });

      mockJobOffersService.create.mockResolvedValue(jobOfferMock);

      const result = await controller.create(createJobOfferDtoMock, activeUserMock);

      expect(mockJobOffersService.create).toHaveBeenCalledWith(
        createJobOfferDtoMock,
        activeUserMock.id,
      );
      expect(result).toEqual(jobOfferMock);
    });

    it('debería usar el id correcto según el usuario actual', async () => {
      const createJobOfferDtoMock = mock<CreateJobOfferDto>({
        title: 'Backend Developer',
        description: 'Descripción de prueba.',
        seniorityId: 2,
      });

      const otherActiveUserMock: ActiveUser = {
        id: 5,
        email: 'jane@example.com',
        role: 'recruiter',
      };

      mockJobOffersService.create.mockResolvedValue(jobOfferMock2);

      await controller.create(createJobOfferDtoMock, otherActiveUserMock);

      expect(mockJobOffersService.create).toHaveBeenCalledWith(
        createJobOfferDtoMock,
        5,
      );
    });
  });


  describe('findAll', () => {
    it('debería llamar a jobOffersService.findAll', async () => {
      const jobOffersMock = [jobOfferMock, jobOfferMock2];
      mockJobOffersService.findAll.mockResolvedValue(jobOffersMock);

      const result = await controller.findAll();

      expect(mockJobOffersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(jobOffersMock);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío si no hay ofertas', async () => {
      mockJobOffersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería llamar a jobOffersService.findOne con el id correcto', async () => {
      mockJobOffersService.findOne.mockResolvedValue(jobOfferMock);

      const result = await controller.findOne('1');

      expect(mockJobOffersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(jobOfferMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockJobOffersService.findOne.mockResolvedValue(jobOfferMock2);

      await controller.findOne('2');

      expect(mockJobOffersService.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('debería llamar a jobOffersService.update con id y DTO correctos', async () => {
      const updateJobOfferDtoMock = mock<UpdateJobOfferDto>({
        title: 'Senior Frontend Developer',
        isActive: false,
      });

      const updatedJobOfferMock = mock<JobOffer>({
        ...jobOfferMock,
        title: 'Senior Frontend Developer',
        isActive: false,
      });

      mockJobOffersService.update.mockResolvedValue(updatedJobOfferMock);

      const result = await controller.update('1', updateJobOfferDtoMock);

      expect(mockJobOffersService.update).toHaveBeenCalledWith(1, updateJobOfferDtoMock);
      expect(result).toEqual(updatedJobOfferMock);
    });
  });

  describe('remove', () => {
    it('debería llamar a jobOffersService.remove con el id correcto', async () => {
      mockJobOffersService.remove.mockResolvedValue({
        message: 'Oferta #1 eliminada correctamente.',
      });

      const result = await controller.remove('1');

      expect(mockJobOffersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Oferta #1 eliminada correctamente.' });
    });
  });
});