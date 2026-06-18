import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { JobApplication } from '../job-applications/entities/job-application.entity';
import { Stage } from '../stages/entities/stage.entity';
import { User } from '../users/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let mockFeedbackRepository: MockProxy<Repository<Feedback>>;

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

  beforeAll(async () => {
    mockFeedbackRepository = mock<Repository<Feedback>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockFeedbackRepository,
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
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un feedback correctamente', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 1,
        stage_id: 1,
        technicalScore: 4,
        softSkillsScore: 3,
        comment: 'Buen candidato',
        internalNotes: 'Notas internas',
        publicFeedback: 'Feedback público',
      });

      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      const result = await service.create(createFeedbackDtoMock, 1);

      expect(mockFeedbackRepository.create).toHaveBeenCalledWith({
        comment: 'Buen candidato',
        technicalScore: 4,
        softSkillsScore: 3,
        internalNotes: 'Notas internas',
        publicFeedback: 'Feedback público',
        application: { id: 1 },
        stage: { id: 1 },
        recruiter: { id: 1 },
      });
      expect(mockFeedbackRepository.save).toHaveBeenCalledWith(feedbackMock);
      expect(result).toEqual(feedbackMock);
    });

    it('debería crear un feedback sin campos opcionales', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 1,
        stage_id: 1,
        technicalScore: undefined,
        softSkillsScore: undefined,
        comment: undefined,
        internalNotes: undefined,
        publicFeedback: undefined,
      });

      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      const result = await service.create(createFeedbackDtoMock, 1);

      expect(mockFeedbackRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          application: { id: 1 },
          stage: { id: 1 },
          recruiter: { id: 1 },
        }),
      );
      expect(result).toEqual(feedbackMock);
    });

    it('debería asignar el recruiterId correctamente', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 1,
        stage_id: 1,
      });

      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      await service.create(createFeedbackDtoMock, 5);

      expect(mockFeedbackRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ recruiter: { id: 5 } }),
      );
    });

    it('debería asignar application y stage como referencias por id', async () => {
      const createFeedbackDtoMock = mock<CreateFeedbackDto>({
        application_id: 3,
        stage_id: 2,
      });

      mockFeedbackRepository.create.mockReturnValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      await service.create(createFeedbackDtoMock, 1);

      expect(mockFeedbackRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          application: { id: 3 },
          stage: { id: 2 },
        }),
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
      expect(result).toHaveLength(2);
      expect(result).toEqual(feedbacksMock);
    });

    it('debería retornar array vacío si no hay feedbacks para esa aplicación', async () => {
      mockFeedbackRepository.find.mockResolvedValue([]);

      const result = await service.findByApplication(99);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
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
      expect(result).toHaveLength(2);
      expect(result).toEqual(feedbacksMock);
    });

    it('debería retornar array vacío si no hay feedbacks', async () => {
      mockFeedbackRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
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

    it('debería actualizar solo los campos enviados', async () => {
      const updateFeedbackDtoMock = mock<UpdateFeedbackDto>({
        publicFeedback: 'Nuevo feedback público',
      });

      const updatedFeedbackMock = mock<Feedback>({
        ...feedbackMock,
        publicFeedback: 'Nuevo feedback público',
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(updatedFeedbackMock);

      const result = await service.update(1, updateFeedbackDtoMock);

      expect(result.publicFeedback).toBe('Nuevo feedback público');
      expect(result.technicalScore).toBe(feedbackMock.technicalScore);
      expect(result.softSkillsScore).toBe(feedbackMock.softSkillsScore);
    });

    it('debería lanzar NotFoundException si el feedback a actualizar no existe', async () => {
      mockFeedbackRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateFeedbackDto>()))
        .rejects
        .toThrow(NotFoundException);

      expect(mockFeedbackRepository.save).not.toHaveBeenCalled();
    });

    it('no debería permitir actualizar application_id ni stage_id', async () => {
      const updateFeedbackDtoMock = mock<UpdateFeedbackDto>({
        technicalScore: 3,
      });

      mockFeedbackRepository.findOne.mockResolvedValue(feedbackMock);
      mockFeedbackRepository.save.mockResolvedValue(feedbackMock);

      await service.update(1, updateFeedbackDtoMock);

      const saveCall = mockFeedbackRepository.save.mock.calls[0][0] as Feedback;
      expect(saveCall).not.toHaveProperty('application_id');
      expect(saveCall).not.toHaveProperty('stage_id');
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
});
