import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { Scorecard } from '../scorecards/entities/scorecard.entity';
import { JobApplication } from '../job-applications/entities/job-application.entity';
import { JobOffer } from '../job-offers/entities/job-offer.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import { Stage } from '../stages/entities/stage.entity';
import { User } from '../users/entities/user.entity';
import { CvFile } from '../cv/entities/cv-file.entity';
import { ClaudeService } from './claude.service';
import { CvService } from '../cv/cv.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let mockFeedbackRepository: MockProxy<Repository<Feedback>>;
  let mockScorecardRepository: MockProxy<Repository<Scorecard>>;
  let mockApplicationRepository: MockProxy<Repository<JobApplication>>;
  let mockClaudeService: MockProxy<ClaudeService>;
  let mockCvService: MockProxy<CvService>;

  const seniorityMock = mock<Seniority>({
    id: 1,
    name: 'junior',
    jobOffers: [],
  });

  const jobOfferMock = mock<JobOffer>({
    id: 1,
    title: 'Frontend Developer',
    description: 'Buscamos un desarrollador frontend con experiencia en React.',
    seniority: seniorityMock,
    isActive: true,
  });

  const applicantMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isActive: true,
  });

  const recruiterMock = mock<User>({
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    isActive: true,
  });

  const stageMock = mock<Stage>({
    id: 1,
    name: 'Entrevista técnica',
    sequenceOrder: 1,
    isTerminal: false,
  });

  const rejectionStageMock = mock<Stage>({
    id: 2,
    name: 'No avanza',
    sequenceOrder: 5,
    isTerminal: true,
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

  const feedbackMock = mock<Feedback>({
    id: 1,
    application: applicationMock,
    stage: stageMock,
    recruiter: recruiterMock,
    technicalScore: 4,
    softSkillsScore: 3,
    comment: 'Buen candidato, buena comunicación técnica.',
    internalNotes: 'Notas internas',
    publicFeedback: '',
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

  const scorecardMock = mock<Scorecard>({
    id: 1,
    feedback: feedbackMock,
    skillName: 'JavaScript',
    score: 4,
    type: 'technical',
    createdAt: new Date(),
  });

  const cvFileMock = mock<CvFile>({
    id: 'uuid-1',
    originalName: 'cv-john-doe.pdf',
    storedName: 'abc123.pdf',
    extension: 'pdf',
    directory: 'uploads/cv',
    userId: 1,
    createdAt: new Date(),
  });

  beforeAll(async () => {
    mockFeedbackRepository = mock<Repository<Feedback>>();
    mockScorecardRepository = mock<Repository<Scorecard>>();
    mockApplicationRepository = mock<Repository<JobApplication>>();
    mockClaudeService = mock<ClaudeService>();
    mockCvService = mock<CvService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockFeedbackRepository,
        },
        {
          provide: getRepositoryToken(Scorecard),
          useValue: mockScorecardRepository,
        },
        {
          provide: getRepositoryToken(JobApplication),
          useValue: mockApplicationRepository,
        },
        {
          provide: ClaudeService,
          useValue: mockClaudeService,
        },
        {
          provide: CvService,
          useValue: mockCvService,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  }, 30000);

  afterEach(() => {
    mockFeedbackRepository.findOne.mockReset();
    mockFeedbackRepository.find.mockReset();
    mockFeedbackRepository.create.mockReset();
    mockFeedbackRepository.save.mockReset();
    mockFeedbackRepository.remove.mockReset();
    mockScorecardRepository.find.mockReset();
    mockApplicationRepository.findOne.mockReset();
    mockClaudeService.generateFeedback.mockReset();
    mockCvService.getLatestCvByUser.mockReset();
  });


  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('debería crear un feedback correctamente si no existe uno previo', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 1,
        stage_id: 1,
        technicalScore: 4,
        softSkillsScore: 3,
        comment: 'Buen candidato',
        internalNotes: 'Notas internas',
        publicFeedback: '',
      });

      mockFeedbackRepository.findOne.mockResolvedValue(null);
      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      const result = await service.create(createFeedbackDtoMock, 2);

      expect(mockFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: {
          application: { id: 1 },
          stage: { id: 1 },
        },
      });
      expect(mockFeedbackRepository.create).toHaveBeenCalledWith({
        comment: 'Buen candidato',
        technicalScore: 4,
        softSkillsScore: 3,
        internalNotes: 'Notas internas',
        publicFeedback: '',
        application: { id: 1 },
        stage: { id: 1 },
        recruiter: { id: 2 },
      });
      expect(mockFeedbackRepository.save).toHaveBeenCalledWith(feedbackMock);
      expect(result).toEqual(feedbackMock);
    });

    it('debería lanzar BadRequestException si ya existe un feedback para esa etapa y aplicación', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 1,
        stage_id: 1,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackMock);

      await expect(service.create(createFeedbackDtoMock, 2))
        .rejects
        .toThrow(BadRequestException);

      await expect(service.create(createFeedbackDtoMock, 2))
        .rejects
        .toThrow('Ya existe un feedback para esta etapa. Editá el feedback existente en lugar de crear uno nuevo.');

      expect(mockFeedbackRepository.create).not.toHaveBeenCalled();
      expect(mockFeedbackRepository.save).not.toHaveBeenCalled();
    });

    it('debería verificar correctamente con distintos application_id y stage_id', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 3,
        stage_id: 2,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(null);
      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      await service.create(createFeedbackDtoMock, 1);

      expect(mockFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: {
          application: { id: 3 },
          stage: { id: 2 },
        },
      });
    });

    it('debería asignar el recruiterId correctamente', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 1,
        stage_id: 1,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(null);
      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      await service.create(createFeedbackDtoMock, 9);

      expect(mockFeedbackRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ recruiter: { id: 9 } }),
      );
    });
  });


  describe('findByApplication', () => {
    it('debería retornar feedbacks por applicationId con relaciones y orden', async () => {
      const feedbacksMock = [feedbackMock, feedbackMock2];
      mockFeedbackRepository.find.mockResolvedValue(feedbacksMock);

      const result = await service.findByApplication(1);

      expect(mockFeedbackRepository.find).toHaveBeenCalledWith({
        where: { application: { id: 1 } },
        relations: ['application', 'stage', 'recruiter'],
        order: { stage: { sequenceOrder: 'ASC' } },
      });
      expect(result).toEqual(feedbacksMock);
    });

    it('debería retornar array vacío si no hay feedbacks para esa aplicación', async () => {
      mockFeedbackRepository.find.mockResolvedValue([]);

      const result = await service.findByApplication(99);

      expect(result).toEqual([]);
    });
  });


  describe('findByApplicationForUser', () => {
    it('debería retornar feedbacks filtrando por applicationId y userId', async () => {
      const feedbacksMock = [feedbackMock];
      mockFeedbackRepository.find.mockResolvedValue(feedbacksMock);

      const result = await service.findByApplicationForUser(1, 1);

      expect(mockFeedbackRepository.find).toHaveBeenCalledWith({
        where: {
          application: { id: 1, applicant: { id: 1 } },
        },
        relations: ['application', 'stage', 'recruiter'],
        order: { stage: { sequenceOrder: 'ASC' } },
      });
      expect(result).toEqual(feedbacksMock);
    });

    it('debería retornar array vacío si el usuario no tiene feedbacks en esa aplicación', async () => {
      mockFeedbackRepository.find.mockResolvedValue([]);

      const result = await service.findByApplicationForUser(1, 99);

      expect(result).toEqual([]);
    });

    it('debería usar el applicationId y userId correctos en el filtro', async () => {
      mockFeedbackRepository.find.mockResolvedValue([feedbackMock2]);

      await service.findByApplicationForUser(5, 10);

      expect(mockFeedbackRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { application: { id: 5, applicant: { id: 10 } } },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los feedbacks con sus relaciones', async () => {
      const feedbacksMock = [feedbackMock, feedbackMock2];
      mockFeedbackRepository.find.mockResolvedValue(feedbacksMock);

      const result = await service.findAll();

      expect(mockFeedbackRepository.find).toHaveBeenCalledWith({
        relations: ['application', 'stage', 'recruiter'],
      });
      expect(result).toEqual(feedbacksMock);
    });

    it('debería retornar array vacío si no hay feedbacks', async () => {
      mockFeedbackRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería retornar un feedback por id con sus relaciones', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(feedbackMock);

      const result = await service.findOne(1);

      expect(mockFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['application', 'stage', 'recruiter'],
      });
      expect(result).toEqual(feedbackMock);
    });

    it('debería lanzar NotFoundException si el feedback no existe', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('El feedback con id #99 no existe');
    });
  });


  describe('update', () => {
    it('debería actualizar un feedback correctamente', async () => {
      const updateFeedbackDtoMock = mock<UpdateFeedbackDto>({
        technicalScore: 5,
        comment: 'Excelente candidato',
      });

      const updatedFeedbackMock = mock<Feedback>({
        ...feedbackMock,
        technicalScore: 5,
        comment: 'Excelente candidato',
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(updatedFeedbackMock);

      const result = await service.update(1, updateFeedbackDtoMock);

      expect(mockFeedbackRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedFeedbackMock);
    });

    it('debería lanzar NotFoundException si el feedback a actualizar no existe', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateFeedbackDto>()))
        .rejects
        .toThrow(NotFoundException);

      expect(mockFeedbackRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debería eliminar un feedback correctamente', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(feedbackMock);
      mockFeedbackRepository.remove.mockResolvedValue(feedbackMock);

      const result = await service.remove(1);

      expect(mockFeedbackRepository.remove).toHaveBeenCalledWith(feedbackMock);
      expect(result).toEqual({ message: 'Feedback #1 eliminado correctamente' });
    });

    it('debería lanzar NotFoundException si el feedback a eliminar no existe', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99))
        .rejects
        .toThrow(NotFoundException);

      expect(mockFeedbackRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('generateFeedbackForOne', () => {
    it('debería generar feedback correctamente cuando todo está disponible', async () => {
      const feedbackWithRelationsMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationMock,
        stage: stageMock,
      });

      const generatedTextMock = 'Este es un feedback generado por IA.';

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithRelationsMock);
      mockScorecardRepository.find.mockResolvedValue([scorecardMock]);
      mockCvService.getLatestCvByUser.mockResolvedValue(cvFileMock);
      mockClaudeService.generateFeedback.mockResolvedValue(generatedTextMock);
      mockFeedbackRepository.save.mockResolvedValue({
        ...feedbackWithRelationsMock,
        publicFeedback: generatedTextMock,
      } as Feedback);

      const result = await service.generateFeedbackForOne(1);

      expect(mockFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'stage',
          'application',
          'application.jobOffer',
          'application.jobOffer.seniority',
          'application.applicant',
        ],
      });
      expect(mockScorecardRepository.find).toHaveBeenCalledWith({
        where: { feedback: { id: 1 } },
      });
      expect(mockCvService.getLatestCvByUser).toHaveBeenCalledWith(applicantMock.id);
      expect(mockClaudeService.generateFeedback).toHaveBeenCalledWith(expect.any(String));
      expect(mockFeedbackRepository.save).toHaveBeenCalled();
      expect(result.publicFeedback).toBe(generatedTextMock);
    });

    it('debería lanzar NotFoundException si el feedback no existe', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(null);

      await expect(service.generateFeedbackForOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.generateFeedbackForOne(99))
        .rejects
        .toThrow('No se encontró el feedback.');

      expect(mockClaudeService.generateFeedback).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el feedback no tiene comentario cargado', async () => {
      const feedbackWithoutCommentMock = mock<Feedback>({
        ...feedbackMock,
        comment: undefined,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithoutCommentMock);

      await expect(service.generateFeedbackForOne(1))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.generateFeedbackForOne(1))
        .rejects
        .toThrow('Este feedback no tiene comentarios cargados todavía.');

      expect(mockClaudeService.generateFeedback).not.toHaveBeenCalled();
    });

    it('debería generar feedback aunque no haya scorecards', async () => {
      const feedbackWithRelationsMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationMock,
        stage: stageMock,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithRelationsMock);
      mockScorecardRepository.find.mockResolvedValue([]);
      mockCvService.getLatestCvByUser.mockResolvedValue(cvFileMock);
      mockClaudeService.generateFeedback.mockResolvedValue('Feedback sin scorecards');
      mockFeedbackRepository.save.mockResolvedValue(feedbackWithRelationsMock);

      const result = await service.generateFeedbackForOne(1);

      expect(mockClaudeService.generateFeedback).toHaveBeenCalledWith(
        expect.stringContaining('No se registraron scorecards para esta etapa.'),
      );
      expect(result).toBeDefined();
    });

    it('debería generar feedback aunque el candidato no tenga CV', async () => {
      const feedbackWithRelationsMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationMock,
        stage: stageMock,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithRelationsMock);
      mockScorecardRepository.find.mockResolvedValue([scorecardMock]);
      mockCvService.getLatestCvByUser.mockResolvedValue(null);
      mockClaudeService.generateFeedback.mockResolvedValue('Feedback sin CV');
      mockFeedbackRepository.save.mockResolvedValue(feedbackWithRelationsMock);

      const result = await service.generateFeedbackForOne(1);

      expect(mockClaudeService.generateFeedback).toHaveBeenCalledWith(
        expect.stringContaining('El candidato no adjuntó CV.'),
      );
      expect(result).toBeDefined();
    });

    it('debería incluir el mensaje de rechazo si la etapa es "No avanza"', async () => {
      const applicationWithRejectionMock = mock<JobApplication>({
        ...applicationMock,
        currentStage: rejectionStageMock,
      });

      const feedbackWithRejectionStageMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationWithRejectionMock,
        stage: rejectionStageMock,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithRejectionStageMock);
      mockScorecardRepository.find.mockResolvedValue([scorecardMock]);
      mockCvService.getLatestCvByUser.mockResolvedValue(cvFileMock);
      mockClaudeService.generateFeedback.mockResolvedValue('Feedback de cierre');
      mockFeedbackRepository.save.mockResolvedValue(feedbackWithRejectionStageMock);

      await service.generateFeedbackForOne(1);

      expect(mockClaudeService.generateFeedback).toHaveBeenCalledWith(
        expect.stringContaining('Esta es la etapa final del proceso y el candidato NO continúa.'),
      );
    });

    it('no debería incluir el mensaje de rechazo si la etapa no es "No avanza"', async () => {
      const feedbackWithRelationsMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationMock,
        stage: stageMock, // ✅ "Entrevista técnica", no es etapa de rechazo
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithRelationsMock);
      mockScorecardRepository.find.mockResolvedValue([scorecardMock]);
      mockCvService.getLatestCvByUser.mockResolvedValue(cvFileMock);
      mockClaudeService.generateFeedback.mockResolvedValue('Feedback intermedio');
      mockFeedbackRepository.save.mockResolvedValue(feedbackWithRelationsMock);

      await service.generateFeedbackForOne(1);

      expect(mockClaudeService.generateFeedback).toHaveBeenCalledWith(
        expect.stringContaining('NO mencionar si el candidato fue contratado'),
      );
    });

    it('debería incluir "No especificado" si el seniority no está definido', async () => {
      const jobOfferWithoutSeniorityMock = mock<JobOffer>({
        ...jobOfferMock,
        seniority: undefined,
      });

      const applicationWithoutSeniorityMock = mock<JobApplication>({
        ...applicationMock,
        jobOffer: jobOfferWithoutSeniorityMock,
      });

      const feedbackWithoutSeniorityMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationWithoutSeniorityMock,
        stage: stageMock,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithoutSeniorityMock);
      mockScorecardRepository.find.mockResolvedValue([]);
      mockCvService.getLatestCvByUser.mockResolvedValue(null);
      mockClaudeService.generateFeedback.mockResolvedValue('Feedback sin seniority');
      mockFeedbackRepository.save.mockResolvedValue(feedbackWithoutSeniorityMock);

      await service.generateFeedbackForOne(1);

      expect(mockClaudeService.generateFeedback).toHaveBeenCalledWith(
        expect.stringContaining('Seniority requerido: No especificado'),
      );
    });

    it('debería guardar el publicFeedback generado en el feedback', async () => {
      const feedbackWithRelationsMock = mock<Feedback>({
        ...feedbackMock,
        application: applicationMock,
        stage: stageMock,
      });

      const generatedTextMock = 'Excelente desempeño en la entrevista técnica.';

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackWithRelationsMock);
      mockScorecardRepository.find.mockResolvedValue([scorecardMock]);
      mockCvService.getLatestCvByUser.mockResolvedValue(cvFileMock);
      mockClaudeService.generateFeedback.mockResolvedValue(generatedTextMock);
      mockFeedbackRepository.save.mockResolvedValue({
        ...feedbackWithRelationsMock,
        publicFeedback: generatedTextMock,
      } as Feedback);

      await service.generateFeedbackForOne(1);

      const saveCall = mockFeedbackRepository.save.mock.calls[0][0] as Feedback;
      expect(saveCall.publicFeedback).toBe(generatedTextMock);
    });
  });
});