import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { JobApplication } from '../job-applications/entities/job-application.entity';
import { Stage } from '../stages/entities/stage.entity';
import { User } from '../users/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let mockFeedbackService: MockProxy<FeedbackService>;

  const stageMock = mock<Stage>({
    id: 1,
    name: 'Postulado',
    sequenceOrder: 1,
    isTerminal: false,
  });

  const recruiterMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isActive: true,
  });

  const applicationMock = mock<JobApplication>({
    id: 1,
    cvPath: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const feedbackMock = mock<Feedback>({
    id: 1,
    application: applicationMock,
    stage: stageMock,
    recruiter: recruiterMock,
    technicalScore: 4,
    softSkillsScore: 3,
    comment: 'Buen candidato',
    internalNotes: 'Notas internas',
    publicFeedback: 'Feedback público',
    createdAt: new Date(),
  });

  const feedbackMock2 = mock<Feedback>({
    id: 2,
    application: applicationMock,
    stage: stageMock,
    recruiter: recruiterMock,
    technicalScore: 5,
    softSkillsScore: 5,
    comment: 'Excelente candidato',
    internalNotes: 'Notas internas 2',
    publicFeedback: 'Feedback público 2',
    createdAt: new Date(),
  });

  const activeUserMock: ActiveUser = {
    id: 1,
    email: 'john@example.com',
    role: 'recruiter',
  };

  beforeAll(async () => {
    mockFeedbackService = mock<FeedbackService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FeedbackController>(FeedbackController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a feedbackService.create con el DTO y el id del usuario actual', async () => {
      const createFeedbackDtoMock: CreateFeedbackDto = {
        application_id: 1,
        stage_id: 1,
        technicalScore: 4,
        softSkillsScore: 3,
        comment: 'Buen candidato',
      } as CreateFeedbackDto;

      mockFeedbackService.create.mockResolvedValue(feedbackMock);

      const result = await controller.create(createFeedbackDtoMock, activeUserMock);

      expect(mockFeedbackService.create).toHaveBeenCalledWith(
        createFeedbackDtoMock,
        activeUserMock.id,
      );
      expect(result).toEqual(feedbackMock);
    });

    it('debería usar el id correcto según el usuario actual', async () => {
      const createFeedbackDtoMock: CreateFeedbackDto = {
        application_id: 1,
        stage_id: 1,
      } as CreateFeedbackDto;

      const otherActiveUserMock: ActiveUser = {
        id: 7,
        email: 'jane@example.com',
        role: 'recruiter',
      };

      mockFeedbackService.create.mockResolvedValue(feedbackMock2);

      await controller.create(createFeedbackDtoMock, otherActiveUserMock);

      expect(mockFeedbackService.create).toHaveBeenCalledWith(
        createFeedbackDtoMock,
        7,
      );
    });
  });

  describe('findAll', () => {
    it('debería llamar a findAll si no se envía applicationId', async () => {
      const feedbacksMock = [feedbackMock, feedbackMock2];
      mockFeedbackService.findAll.mockResolvedValue(feedbacksMock);

      const result = await controller.findAll();

      expect(mockFeedbackService.findAll).toHaveBeenCalled();
      expect(mockFeedbackService.findByApplication).not.toHaveBeenCalled();
      expect(result).toEqual(feedbacksMock);
    });

    it('debería llamar a findByApplication si se envía applicationId', async () => {
      const feedbacksMock = [feedbackMock];
      mockFeedbackService.findByApplication.mockResolvedValue(feedbacksMock);

      const result = await controller.findAll('1');

      expect(mockFeedbackService.findByApplication).toHaveBeenCalledWith(1);
      expect(mockFeedbackService.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(feedbacksMock);
    });

    it('debería retornar un array vacío si no hay feedbacks', async () => {
      mockFeedbackService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('debería retornar array vacío si no hay feedbacks para esa aplicación', async () => {
      mockFeedbackService.findByApplication.mockResolvedValue([]);

      const result = await controller.findAll('99');

      expect(result).toEqual([]);
    });
  });

  describe('findMySentFeedbacks', () => {
    it('debería llamar a findByRecruiter con el id del usuario actual', async () => {
      const feedbacksMock = [feedbackMock, feedbackMock2];
      mockFeedbackService.findByRecruiter.mockResolvedValue(feedbacksMock);

      const result = await controller.findMySentFeedbacks(activeUserMock);

      expect(mockFeedbackService.findByRecruiter).toHaveBeenCalledWith(
        activeUserMock.id,
      );
      expect(result).toEqual(feedbacksMock);
    });

    it('debería usar el id correcto según el recruiter actual', async () => {
      const otherActiveUserMock: ActiveUser = {
        id: 12,
        email: 'jane@example.com',
        role: 'recruiter',
      };

      mockFeedbackService.findByRecruiter.mockResolvedValue([feedbackMock2]);

      await controller.findMySentFeedbacks(otherActiveUserMock);

      expect(mockFeedbackService.findByRecruiter).toHaveBeenCalledWith(12);
    });

    it('debería retornar array vacío si el recruiter no envió feedbacks', async () => {
      mockFeedbackService.findByRecruiter.mockResolvedValue([]);

      const result = await controller.findMySentFeedbacks(activeUserMock);

      expect(result).toEqual([]);
    });
  });

  describe('findAllMyFeedbacks', () => {
    it('debería llamar a findAllForApplicant con el id del usuario actual', async () => {
      const applicantUserMock: ActiveUser = {
        id: 5,
        email: 'applicant@example.com',
        role: 'applicant',
      };

      const feedbacksMock = [feedbackMock];
      mockFeedbackService.findAllForApplicant.mockResolvedValue(feedbacksMock);

      const result = await controller.findAllMyFeedbacks(applicantUserMock);

      expect(mockFeedbackService.findAllForApplicant).toHaveBeenCalledWith(5);
      expect(result).toEqual(feedbacksMock);
    });

    it('debería usar el id correcto según el applicant actual', async () => {
      const otherApplicantMock: ActiveUser = {
        id: 8,
        email: 'other@example.com',
        role: 'applicant',
      };

      mockFeedbackService.findAllForApplicant.mockResolvedValue([feedbackMock2]);

      await controller.findAllMyFeedbacks(otherApplicantMock);

      expect(mockFeedbackService.findAllForApplicant).toHaveBeenCalledWith(8);
    });

    it('debería retornar array vacío si el applicant no tiene feedbacks públicos', async () => {
      const applicantUserMock: ActiveUser = {
        id: 5,
        email: 'applicant@example.com',
        role: 'applicant',
      };

      mockFeedbackService.findAllForApplicant.mockResolvedValue([]);

      const result = await controller.findAllMyFeedbacks(applicantUserMock);

      expect(result).toEqual([]);
    });
  });

  describe('findMyFeedback', () => {
    it('debería llamar a findByApplicationForApplicant con applicationId y el id del usuario actual', async () => {
      const feedbacksMock = [feedbackMock];
      mockFeedbackService.findByApplicationForApplicant.mockResolvedValue(feedbacksMock);

      const result = await controller.findMyFeedback('1', activeUserMock);

      expect(mockFeedbackService.findByApplicationForApplicant).toHaveBeenCalledWith(
        1,
        activeUserMock.id,
      );
      expect(result).toEqual(feedbacksMock);
    });

    it('debería usar el id correcto según el usuario actual', async () => {
      const otherActiveUserMock: ActiveUser = {
        id: 9,
        email: 'jane@example.com',
        role: 'applicant',
      };

      mockFeedbackService.findByApplicationForApplicant.mockResolvedValue([feedbackMock2]);

      await controller.findMyFeedback('2', otherActiveUserMock);

      expect(mockFeedbackService.findByApplicationForApplicant).toHaveBeenCalledWith(2, 9);
    });

    it('debería retornar array vacío si no hay feedback para esa aplicación y usuario', async () => {
      mockFeedbackService.findByApplicationForApplicant.mockResolvedValue([]);

      const result = await controller.findMyFeedback('99', activeUserMock);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería llamar a feedbackService.findOne con el id correcto', async () => {
      mockFeedbackService.findOne.mockResolvedValue(feedbackMock);

      const result = await controller.findOne('1');

      expect(mockFeedbackService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(feedbackMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockFeedbackService.findOne.mockResolvedValue(feedbackMock2);

      await controller.findOne('2');

      expect(mockFeedbackService.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('debería llamar a feedbackService.update con id y DTO correctos', async () => {
      const updateFeedbackDtoMock: UpdateFeedbackDto = {
        technicalScore: 5,
        comment: 'Excelente candidato',
      } as UpdateFeedbackDto;

      const updatedFeedbackMock = mock<Feedback>({
        ...feedbackMock,
        technicalScore: 5,
        comment: 'Excelente candidato',
      });

      mockFeedbackService.update.mockResolvedValue(updatedFeedbackMock);

      const result = await controller.update('1', updateFeedbackDtoMock);

      expect(mockFeedbackService.update).toHaveBeenCalledWith(1, updateFeedbackDtoMock);
      expect(result).toEqual(updatedFeedbackMock);
    });
  });

  describe('remove', () => {
    it('debería llamar a feedbackService.remove con el id correcto', async () => {
      mockFeedbackService.remove.mockResolvedValue({
        message: 'Feedback #1 eliminado correctamente',
      });

      const result = await controller.remove('1');

      expect(mockFeedbackService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Feedback #1 eliminado correctamente' });
    });
  });

  describe('generateFeedbackForOne', () => {
    it('debería llamar a generateFeedbackForOne con el id correcto', async () => {
      mockFeedbackService.generateFeedbackForOne.mockResolvedValue(feedbackMock);

      const result = await controller.generateFeedbackForOne('1');

      expect(mockFeedbackService.generateFeedbackForOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(feedbackMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockFeedbackService.generateFeedbackForOne.mockResolvedValue(feedbackMock2);

      await controller.generateFeedbackForOne('5');

      expect(mockFeedbackService.generateFeedbackForOne).toHaveBeenCalledWith(5);
    });
  });
});