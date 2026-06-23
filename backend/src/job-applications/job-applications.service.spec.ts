import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { JobApplication } from './entities/job-application.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { JobOffersService } from '../job-offers/job-offers.service';
import { StagesService } from '../stages/stages.service';
import { ApplicationFactory } from './factories/application.factory';
import { JobOffer } from '../job-offers/entities/job-offer.entity';
import { Stage } from '../stages/entities/stage.entity';
import { User } from '../users/entities/user.entity';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;
  let mockApplicationRepo: MockProxy<Repository<JobApplication>>;
  let mockFeedbackRepo: MockProxy<Repository<Feedback>>;
  let mockJobOffersService: MockProxy<JobOffersService>;
  let mockStagesService: MockProxy<StagesService>;
  let mockApplicationFactory: MockProxy<ApplicationFactory>;

  // ✅ Mocks reutilizables
  const stageMock = mock<Stage>({
    id: 1,
    name: 'Postulado',
    sequenceOrder: 1,
    isTerminal: false,
    isHiredStage: false,
  });

  const interviewStageMock = mock<Stage>({
    id: 2,
    name: 'Entrevista',
    sequenceOrder: 2,
    isTerminal: false,
    isHiredStage: false,
  });

  const hiredStageMock = mock<Stage>({
    id: 3,
    name: 'Contratado',
    sequenceOrder: 3,
    isTerminal: false,
    isHiredStage: true,
  });

  const terminalStageMock = mock<Stage>({
    id: 4,
    name: 'Finalizado',
    sequenceOrder: 4,
    isTerminal: true,
    isHiredStage: false,
  });

  const allStagesMock = [stageMock, interviewStageMock, hiredStageMock, terminalStageMock];

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

  const feedbackStage1Mock = mock<Feedback>({
    id: 1,
    stage: stageMock,
  });

  const feedbackStage2Mock = mock<Feedback>({
    id: 2,
    stage: interviewStageMock,
  });

  beforeAll(async () => {
    mockApplicationRepo = mock<Repository<JobApplication>>();
    mockFeedbackRepo = mock<Repository<Feedback>>();
    mockJobOffersService = mock<JobOffersService>();
    mockStagesService = mock<StagesService>();
    mockApplicationFactory = mock<ApplicationFactory>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        {
          provide: getRepositoryToken(JobApplication),
          useValue: mockApplicationRepo,
        },
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockFeedbackRepo,
        },
        {
          provide: JobOffersService,
          useValue: mockJobOffersService,
        },
        {
          provide: StagesService,
          useValue: mockStagesService,
        },
        {
          provide: ApplicationFactory,
          useValue: mockApplicationFactory,
        },
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
  }, 30000);

  afterEach(() => {
    mockApplicationRepo.findOne.mockReset();
    mockApplicationRepo.find.mockReset();
    mockApplicationRepo.create.mockReset();
    mockApplicationRepo.save.mockReset();
    mockApplicationRepo.remove.mockReset();
    mockFeedbackRepo.find.mockReset();
    mockJobOffersService.findOne.mockReset();
    mockStagesService.findInitialStage.mockReset();
    mockStagesService.findAll.mockReset();
    mockStagesService.findOne.mockReset();
    mockApplicationFactory.create.mockReset();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('debería crear una postulación correctamente', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 1,
      });

      mockJobOffersService.findOne.mockResolvedValue(jobOfferMock);
      mockApplicationRepo.findOne.mockResolvedValue(null);
      mockStagesService.findInitialStage.mockResolvedValue(stageMock);
      mockStagesService.findAll.mockResolvedValue(allStagesMock);
      mockApplicationFactory.create.mockResolvedValue(applicationMock);

      const result = await service.create(createJobApplicationDtoMock, 1);

      expect(mockJobOffersService.findOne).toHaveBeenCalledWith(1);
      expect(mockStagesService.findInitialStage).toHaveBeenCalled();
      expect(mockStagesService.findAll).toHaveBeenCalled();
      expect(mockApplicationFactory.create).toHaveBeenCalledWith(
        jobOfferMock.id,
        1,
        stageMock,
        allStagesMock,
      );
      expect(result).toEqual(applicationMock);
    });

    it('debería lanzar NotFoundException si la oferta no existe', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 99,
      });

      mockJobOffersService.findOne.mockRejectedValue(
        new NotFoundException('La oferta de trabajo no existe.'),
      );

      await expect(service.create(createJobApplicationDtoMock, 1))
        .rejects
        .toThrow(NotFoundException);

      expect(mockApplicationFactory.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la oferta no está activa', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 1,
      });

      const inactiveJobOfferMock = mock<JobOffer>({
        ...jobOfferMock,
        isActive: false,
      });

      mockJobOffersService.findOne.mockResolvedValue(inactiveJobOfferMock);

      await expect(service.create(createJobApplicationDtoMock, 1))
        .rejects
        .toThrow(BadRequestException);

      await expect(service.create(createJobApplicationDtoMock, 1))
        .rejects
        .toThrow('Esta oferta no se encuentra activa.');

      expect(mockApplicationFactory.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el usuario ya se postuló', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 1,
      });

      mockJobOffersService.findOne.mockResolvedValue(jobOfferMock);
      mockApplicationRepo.findOne.mockResolvedValue(applicationMock);

      await expect(service.create(createJobApplicationDtoMock, 1))
        .rejects
        .toThrow(BadRequestException);

      await expect(service.create(createJobApplicationDtoMock, 1))
        .rejects
        .toThrow('Ya te has postulado a esta oferta.');

      expect(mockApplicationFactory.create).not.toHaveBeenCalled();
    });

    it('debería verificar si ya existe la postulación con el applicantId y jobOfferId correctos', async () => {
      const createJobApplicationDtoMock = mock<CreateJobApplicationDto>({
        jobOfferId: 1,
      });

      mockJobOffersService.findOne.mockResolvedValue(jobOfferMock);
      mockApplicationRepo.findOne.mockResolvedValue(null);
      mockStagesService.findInitialStage.mockResolvedValue(stageMock);
      mockStagesService.findAll.mockResolvedValue(allStagesMock);
      mockApplicationFactory.create.mockResolvedValue(applicationMock);

      await service.create(createJobApplicationDtoMock, 1);

      expect(mockApplicationRepo.findOne).toHaveBeenCalledWith({
        where: {
          applicant: { id: 1 },
          jobOffer: { id: 1 },
        },
      });
    });
  });

  describe('exists', () => {
    it('debería retornar true si la postulación existe', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(applicationMock);

      const result = await service.exists(1, 1);

      expect(result).toBe(true);
      expect(mockApplicationRepo.findOne).toHaveBeenCalledWith({
        where: {
          applicant: { id: 1 },
          jobOffer: { id: 1 },
        },
      });
    });

    it('debería retornar false si la postulación no existe', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(null);

      const result = await service.exists(1, 99);

      expect(result).toBe(false);
    });
  });


  describe('findAll', () => {
    it('debería retornar todas las postulaciones con sus relaciones', async () => {
      const applicationsMock = [applicationMock, applicationMock2];
      mockApplicationRepo.find.mockResolvedValue(applicationsMock);

      const result = await service.findAll();

      expect(mockApplicationRepo.find).toHaveBeenCalledWith({
        relations: ['jobOffer', 'applicant', 'currentStage'],
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(applicationsMock);
    });

    it('debería retornar un array vacío si no hay postulaciones', async () => {
      mockApplicationRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByJobOffer', () => {
    it('debería retornar postulaciones por oferta de trabajo', async () => {
      const applicationsMock = [applicationMock, applicationMock2];
      mockApplicationRepo.find.mockResolvedValue(applicationsMock);

      const result = await service.findByJobOffer(1);

      expect(mockApplicationRepo.find).toHaveBeenCalledWith({
        where: { jobOffer: { id: 1 } },
        relations: ['jobOffer', 'applicant', 'currentStage'],
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(applicationsMock);
    });

    it('debería retornar array vacío si no hay postulaciones para esa oferta', async () => {
      mockApplicationRepo.find.mockResolvedValue([]);

      const result = await service.findByJobOffer(99);

      expect(result).toEqual([]);
    });
  });


  describe('findByApplicant', () => {
    it('debería retornar postulaciones por applicantId con relaciones y orden DESC', async () => {
      const applicationsMock = [applicationMock2, applicationMock];
      mockApplicationRepo.find.mockResolvedValue(applicationsMock);

      const result = await service.findByApplicant(1);

      expect(mockApplicationRepo.find).toHaveBeenCalledWith({
        where: { applicant: { id: 1 } },
        relations: ['jobOffer', 'currentStage'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(applicationsMock);
    });

    it('debería retornar array vacío si el applicant no tiene postulaciones', async () => {
      mockApplicationRepo.find.mockResolvedValue([]);

      const result = await service.findByApplicant(99);

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería retornar una postulación por id sin relaciones', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(applicationMock);

      const result = await service.findOne(1);

      expect(mockApplicationRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [],
      });
      expect(result).toEqual(applicationMock);
    });

    it('debería retornar una postulación por id con relaciones', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(applicationMock);

      const result = await service.findOne(1, ['jobOffer', 'applicant']);

      expect(mockApplicationRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['jobOffer', 'applicant'],
      });
      expect(result).toEqual(applicationMock);
    });

    it('debería lanzar NotFoundException si la postulación no existe', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('No se encontró la postulación.');
    });
  });


  describe('update', () => {
    it('debería actualizar la etapa de una postulación correctamente (etapa no hiring)', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 2,
      });

      const applicationWithStageMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: stageMock,
      });

      const updatedApplicationMock = mock<JobApplication>({
        ...applicationWithStageMock,
        currentStage: interviewStageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationWithStageMock);
      mockStagesService.findOne.mockResolvedValue(interviewStageMock);
      mockApplicationRepo.save.mockResolvedValue(updatedApplicationMock);

      const result = await service.update(1, updateJobApplicationDtoMock);

      expect(mockStagesService.findOne).toHaveBeenCalledWith(2);
      expect(mockFeedbackRepo.find).not.toHaveBeenCalled();
      expect(mockApplicationRepo.save).toHaveBeenCalled();
      expect(result).toEqual(updatedApplicationMock);
    });

    it('debería lanzar BadRequestException si la postulación ya está en etapa terminal', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 2,
      });

      const terminalApplicationMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: terminalStageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(terminalApplicationMock);
      mockStagesService.findOne.mockResolvedValue(stageMock);

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow(BadRequestException);

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow('No se puede cambiar la etapa de una postulación que ya ha finalizado.');

      expect(mockApplicationRepo.save).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la postulación a actualizar no existe', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateJobApplicationDto>()))
        .rejects
        .toThrow(NotFoundException);

      expect(mockApplicationRepo.save).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la etapa destino no existe', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 99,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationMock);
      mockStagesService.findOne.mockRejectedValue(
        new NotFoundException('No se encontró ninguna etapa.'),
      );

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow(NotFoundException);

      expect(mockApplicationRepo.save).not.toHaveBeenCalled();
    });

    it('debería permitir mover a etapa de contratación si hay 2+ feedbacks de etapas distintas', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 3,
      });

      const applicationWithStageMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: interviewStageMock,
      });

      const updatedApplicationMock = mock<JobApplication>({
        ...applicationWithStageMock,
        currentStage: hiredStageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationWithStageMock);
      mockStagesService.findOne.mockResolvedValue(hiredStageMock);
      mockFeedbackRepo.find.mockResolvedValue([feedbackStage1Mock, feedbackStage2Mock]);
      mockApplicationRepo.save.mockResolvedValue(updatedApplicationMock);

      const result = await service.update(1, updateJobApplicationDtoMock);

      expect(mockFeedbackRepo.find).toHaveBeenCalledWith({
        where: { application: { id: 1 } },
      });
      expect(mockApplicationRepo.save).toHaveBeenCalled();
      expect(result.currentStage).toEqual(hiredStageMock);
    });

    it('debería lanzar BadRequestException si hay menos de 2 feedbacks de etapas distintas al contratar', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 3,
      });

      const applicationWithStageMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: interviewStageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationWithStageMock);
      mockStagesService.findOne.mockResolvedValue(hiredStageMock);
      // ✅ Solo 1 feedback (de una sola etapa)
      mockFeedbackRepo.find.mockResolvedValue([feedbackStage1Mock]);

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow(BadRequestException);

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow('No se puede contratar a un candidato sin al menos 2 feedbacks de etapas distintas.');

      expect(mockApplicationRepo.save).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si no hay feedbacks al intentar contratar', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 3,
      });

      const applicationWithStageMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: interviewStageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationWithStageMock);
      mockStagesService.findOne.mockResolvedValue(hiredStageMock);
      mockFeedbackRepo.find.mockResolvedValue([]);

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow(BadRequestException);

      expect(mockApplicationRepo.save).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si hay 2 feedbacks pero de la misma etapa', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 3,
      });

      const applicationWithStageMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: interviewStageMock,
      });

      const duplicateStageFeedbackMock = mock<Feedback>({
        id: 3,
        stage: stageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationWithStageMock);
      mockStagesService.findOne.mockResolvedValue(hiredStageMock);
      mockFeedbackRepo.find.mockResolvedValue([feedbackStage1Mock, duplicateStageFeedbackMock]);

      await expect(service.update(1, updateJobApplicationDtoMock))
        .rejects
        .toThrow(BadRequestException);

      expect(mockApplicationRepo.save).not.toHaveBeenCalled();
    });

    it('debería contar correctamente 3+ feedbacks de distintas etapas', async () => {
      const updateJobApplicationDtoMock = mock<UpdateJobApplicationDto>({
        stageId: 3,
      });

      const thirdStageFeedbackMock = mock<Feedback>({
        id: 3,
        stage: mock<Stage>({ id: 5, name: 'Final', isTerminal: false, isHiredStage: false }),
      });

      const applicationWithStageMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: interviewStageMock,
      });

      const updatedApplicationMock = mock<JobApplication>({
        ...applicationWithStageMock,
        currentStage: hiredStageMock,
      });

      mockApplicationRepo.findOne.mockResolvedValue(applicationWithStageMock);
      mockStagesService.findOne.mockResolvedValue(hiredStageMock);
      mockFeedbackRepo.find.mockResolvedValue([
        feedbackStage1Mock,
        feedbackStage2Mock,
        thirdStageFeedbackMock,
      ]);
      mockApplicationRepo.save.mockResolvedValue(updatedApplicationMock);

      const result = await service.update(1, updateJobApplicationDtoMock);

      expect(result.currentStage).toEqual(hiredStageMock);
    });
  });


  describe('remove', () => {
    it('debería eliminar una postulación correctamente', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(applicationMock);
      mockApplicationRepo.remove.mockResolvedValue(applicationMock);

      const result = await service.remove(1);

      expect(mockApplicationRepo.remove).toHaveBeenCalledWith(applicationMock);
      expect(result).toEqual(applicationMock);
    });

    it('debería lanzar NotFoundException si la postulación a eliminar no existe', async () => {
      mockApplicationRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99))
        .rejects
        .toThrow(NotFoundException);

      expect(mockApplicationRepo.remove).not.toHaveBeenCalled();
    });
  });
});