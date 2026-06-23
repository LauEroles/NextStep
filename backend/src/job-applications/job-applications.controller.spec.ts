import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { JobApplication } from './entities/job-application.entity';
import { JobOffer } from '../job-offers/entities/job-offer.entity';
import { Stage } from '../stages/entities/stage.entity';
import { User } from '../users/entities/user.entity';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('JobApplicationsController', () => {
  let controller: JobApplicationsController;
  let mockJobApplicationsService: MockProxy<JobApplicationsService>;

  const stageMock = mock<Stage>({
    id: 1,
    name: 'Postulado',
    sequenceOrder: 1,
    isTerminal: false,
  });

  const jobOfferMock = mock<JobOffer>({
    id: 1,
    title: 'Frontend Developer',
    description: 'Descripción de prueba',
    isActive: true,
  });

  const applicantMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  });

  const applicationMock = mock<JobApplication>({
    id: 1,
    jobOffer: jobOfferMock,
    applicant: applicantMock,
    currentStage: stageMock,
    cvPath: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const applicationMock2 = mock<JobApplication>({
    id: 2,
    jobOffer: jobOfferMock,
    applicant: applicantMock,
    currentStage: stageMock,
    cvPath: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const activeUserMock: ActiveUser = {
    id: 1,
    email: 'john@example.com',
    role: 'applicant',
  };

  beforeAll(async () => {
    mockJobApplicationsService = mock<JobApplicationsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationsController],
      providers: [
        {
          provide: JobApplicationsService,
          useValue: mockJobApplicationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobApplicationsController>(JobApplicationsController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });


  describe('create', () => {
    it('debería llamar a jobApplicationsService.create con el DTO y el id del usuario actual', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 1,
      });

      mockJobApplicationsService.create.mockResolvedValue(applicationMock);

      const result = await controller.create(createJobApplicationDtoMock, activeUserMock);

      expect(mockJobApplicationsService.create).toHaveBeenCalledWith(
        createJobApplicationDtoMock,
        activeUserMock.id,
      );
      expect(result).toEqual(applicationMock);
    });

    it('debería usar el id correcto según el usuario actual', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 2,
      });

      const otherActiveUserMock: ActiveUser = {
        id: 8,
        email: 'jane@example.com',
        role: 'applicant',
      };

      mockJobApplicationsService.create.mockResolvedValue(applicationMock2);

      await controller.create(createJobApplicationDtoMock, otherActiveUserMock);

      expect(mockJobApplicationsService.create).toHaveBeenCalledWith(
        createJobApplicationDtoMock,
        8,
      );
    });
  });


  describe('findAll', () => {
    it('debería llamar a findAll si no se envía jobOfferId', async () => {
      const applicationsMock = [applicationMock, applicationMock2];
      mockJobApplicationsService.findAll.mockResolvedValue(applicationsMock);

      const result = await controller.findAll();

      expect(mockJobApplicationsService.findAll).toHaveBeenCalled();
      expect(mockJobApplicationsService.findByJobOffer).not.toHaveBeenCalled();
      expect(result).toEqual(applicationsMock);
    });

    it('debería llamar a findByJobOffer si se envía jobOfferId', async () => {
      const applicationsMock = [applicationMock];
      mockJobApplicationsService.findByJobOffer.mockResolvedValue(applicationsMock);

      const result = await controller.findAll('1');

      expect(mockJobApplicationsService.findByJobOffer).toHaveBeenCalledWith(1);
      expect(mockJobApplicationsService.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(applicationsMock);
    });

    it('debería retornar un array vacío si no hay postulaciones', async () => {
      mockJobApplicationsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('debería retornar array vacío si no hay postulaciones para esa oferta', async () => {
      mockJobApplicationsService.findByJobOffer.mockResolvedValue([]);

      const result = await controller.findAll('99');

      expect(result).toEqual([]);
    });
  });


  describe('findMyApplications', () => {
    it('debería llamar a findByApplicant con el id del usuario actual', async () => {
      const applicationsMock = [applicationMock];
      mockJobApplicationsService.findByApplicant.mockResolvedValue(applicationsMock);

      const result = await controller.findMyApplications(activeUserMock);

      expect(mockJobApplicationsService.findByApplicant).toHaveBeenCalledWith(
        activeUserMock.id,
      );
      expect(result).toEqual(applicationsMock);
    });

    it('debería usar el id correcto según el usuario actual', async () => {
      const otherActiveUserMock: ActiveUser = {
        id: 10,
        email: 'jane@example.com',
        role: 'applicant',
      };

      mockJobApplicationsService.findByApplicant.mockResolvedValue([applicationMock2]);

      await controller.findMyApplications(otherActiveUserMock);

      expect(mockJobApplicationsService.findByApplicant).toHaveBeenCalledWith(10);
    });

    it('debería retornar array vacío si el usuario no tiene postulaciones', async () => {
      mockJobApplicationsService.findByApplicant.mockResolvedValue([]);

      const result = await controller.findMyApplications(activeUserMock);

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería llamar a findOne con el id y las relaciones correctas', async () => {
      mockJobApplicationsService.findOne.mockResolvedValue(applicationMock);

      const result = await controller.findOne('1');

      expect(mockJobApplicationsService.findOne).toHaveBeenCalledWith(1, [
        'applicant',
        'jobOffer',
        'currentStage',
      ]);
      expect(result).toEqual(applicationMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockJobApplicationsService.findOne.mockResolvedValue(applicationMock2);

      await controller.findOne('2');

      expect(mockJobApplicationsService.findOne).toHaveBeenCalledWith(2, [
        'applicant',
        'jobOffer',
        'currentStage',
      ]);
    });
  });


  describe('update', () => {
    it('debería llamar a update con id y DTO correctos', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 2,
      });

      const updatedApplicationMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: mock<Stage>({ id: 2, name: 'Entrevista', isTerminal: false }),
      });

      mockJobApplicationsService.update.mockResolvedValue(updatedApplicationMock);

      const result = await controller.update('1', updateJobApplicationDtoMock);

      expect(mockJobApplicationsService.update).toHaveBeenCalledWith(
        1,
        updateJobApplicationDtoMock,
      );
      expect(result).toEqual(updatedApplicationMock);
    });
  });


  describe('remove', () => {
    it('debería llamar a remove con el id correcto', async () => {
      mockJobApplicationsService.remove.mockResolvedValue(applicationMock);

      const result = await controller.remove('1');

      expect(mockJobApplicationsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(applicationMock);
    });
  });
});