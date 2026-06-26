import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ScorecardsService } from './scorecards.service';
import { Scorecard } from './entities/scorecard.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';

describe('ScorecardsService', () => {
  let service: ScorecardsService;
  let mockScorecardRepository: MockProxy<Repository<Scorecard>>;

  const feedbackMock = mock<Feedback>({
    id: 1,
    comment: 'Buen candidato',
    technicalScore: 4,
    softSkillsScore: 3,
    internalNotes: 'Notas internas',
    publicFeedback: 'Feedback público',
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

  const scorecardMock2 = mock<Scorecard>({
    id: 2,
    feedback: feedbackMock,
    skillName: 'Comunicación',
    score: 3,
    type: 'soft',
    createdAt: new Date(),
  });

  beforeAll(async () => {
    mockScorecardRepository = mock<Repository<Scorecard>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScorecardsService,
        {
          provide: getRepositoryToken(Scorecard),
          useValue: mockScorecardRepository,
        },
      ],
    }).compile();

    service = module.get<ScorecardsService>(ScorecardsService);
  }, 30000);

  afterEach(() => {
    mockScorecardRepository.findOne.mockReset();
    mockScorecardRepository.find.mockReset();
    mockScorecardRepository.create.mockReset();
    mockScorecardRepository.save.mockReset();
    mockScorecardRepository.remove.mockReset();
  });


  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('create', () => {
    it('debería crear un scorecard técnico correctamente', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 1,
        skillName: 'JavaScript',
        score: 4,
        type: 'technical',
      });

      mockScorecardRepository.create.mockReturnValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(scorecardMock);

      const result = await service.create(createScorecardDtoMock);

      expect(mockScorecardRepository.create).toHaveBeenCalledWith({
        skillName: 'JavaScript',
        score: 4,
        type: 'technical',
        feedback: { id: 1 },
      });
      expect(mockScorecardRepository.save).toHaveBeenCalledWith(scorecardMock);
      expect(result).toEqual(scorecardMock);
    });

    it('debería crear un scorecard de soft skills correctamente', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 1,
        skillName: 'Comunicación',
        score: 3,
        type: 'soft',
      });

      mockScorecardRepository.create.mockReturnValue(scorecardMock2);
      mockScorecardRepository.save.mockResolvedValue(scorecardMock2);

      const result = await service.create(createScorecardDtoMock);

      expect(mockScorecardRepository.create).toHaveBeenCalledWith({
        skillName: 'Comunicación',
        score: 3,
        type: 'soft',
        feedback: { id: 1 },
      });
      expect(result.type).toBe('soft');
      expect(result).toEqual(scorecardMock2);
    });

    it('debería asignar el feedback como referencia por id', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 5,
        skillName: 'TypeScript',
        score: 5,
        type: 'technical',
      });

      mockScorecardRepository.create.mockReturnValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(scorecardMock);

      await service.create(createScorecardDtoMock);

      expect(mockScorecardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ feedback: { id: 5 } }),
      );
      expect(mockScorecardRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ feedbackId: 5 }),
      );
    });

    it('debería crear un scorecard con puntaje mínimo', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 1,
        skillName: 'JavaScript',
        score: 1,
        type: 'technical',
      });

      mockScorecardRepository.create.mockReturnValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(scorecardMock);

      await service.create(createScorecardDtoMock);

      expect(mockScorecardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ score: 1 }),
      );
    });

    it('debería crear un scorecard con puntaje máximo', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 1,
        skillName: 'JavaScript',
        score: 5,
        type: 'technical',
      });

      mockScorecardRepository.create.mockReturnValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(scorecardMock);

      await service.create(createScorecardDtoMock);

      expect(mockScorecardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ score: 5 }),
      );
    });
  });


  describe('findAll', () => {
    it('debería retornar todos los scorecards con sus relaciones', async () => {
      const scorecardsMock = [scorecardMock, scorecardMock2];
      mockScorecardRepository.find.mockResolvedValue(scorecardsMock);

      const result = await service.findAll();

      expect(mockScorecardRepository.find).toHaveBeenCalledWith({
        relations: ['feedback'],
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(scorecardsMock);
    });

    it('debería retornar array vacío si no hay scorecards', async () => {
      mockScorecardRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });


  describe('findByFeedback', () => {
    it('debería retornar scorecards por feedbackId', async () => {
      const scorecardsMock = [scorecardMock, scorecardMock2];
      mockScorecardRepository.find.mockResolvedValue(scorecardsMock);

      const result = await service.findByFeedback(1);

      expect(mockScorecardRepository.find).toHaveBeenCalledWith({
        where: { feedback: { id: 1 } },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(scorecardsMock);
    });

    it('debería retornar array vacío si no hay scorecards para ese feedback', async () => {
      mockScorecardRepository.find.mockResolvedValue([]);

      const result = await service.findByFeedback(99);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería filtrar correctamente por feedbackId', async () => {
      mockScorecardRepository.find.mockResolvedValue([scorecardMock]);

      await service.findByFeedback(3);

      expect(mockScorecardRepository.find).toHaveBeenCalledWith({
        where: { feedback: { id: 3 } },
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar un scorecard por id con sus relaciones', async () => {
      mockScorecardRepository.findOne.mockResolvedValue(scorecardMock);

      const result = await service.findOne(1);

      expect(mockScorecardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['feedback'],
      });
      expect(result).toEqual(scorecardMock);
    });

    it('debería lanzar NotFoundException si el scorecard no existe', async () => {
      mockScorecardRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('Scorecard con id #99 no existe');
    });
  });


  describe('update', () => {
    it('debería actualizar un scorecard correctamente', async () => {
      const updateScorecardDtoMock = mock<UpdateScorecardDto>({
        skillName: 'TypeScript',
        score: 5,
      });

      const updatedScorecardMock = mock<Scorecard>({
        ...scorecardMock,
        skillName: 'TypeScript',
        score: 5,
      });

      mockScorecardRepository.findOne.mockResolvedValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(updatedScorecardMock);

      const result = await service.update(1, updateScorecardDtoMock);

      expect(mockScorecardRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedScorecardMock);
    });

    it('debería actualizar el tipo de scorecard correctamente', async () => {
      const updateScorecardDtoMock = mock<UpdateScorecardDto>({
        type: 'soft',
      });

      const updatedScorecardMock = mock<Scorecard>({
        ...scorecardMock,
        type: 'soft',
      });

      mockScorecardRepository.findOne.mockResolvedValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(updatedScorecardMock);

      const result = await service.update(1, updateScorecardDtoMock);

      expect(result.type).toBe('soft');
    });

    it('debería actualizar solo los campos enviados', async () => {
      const updateScorecardDtoMock = mock<UpdateScorecardDto>({
        score: 2,
      });

      const updatedScorecardMock = mock<Scorecard>({
        ...scorecardMock,
        score: 2,
      });

      mockScorecardRepository.findOne.mockResolvedValue(scorecardMock);
      mockScorecardRepository.save.mockResolvedValue(updatedScorecardMock);

      const result = await service.update(1, updateScorecardDtoMock);

      expect(result.score).toBe(2);
      expect(result.skillName).toBe(scorecardMock.skillName);
      expect(result.type).toBe(scorecardMock.type);
    });

    it('debería lanzar NotFoundException si el scorecard a actualizar no existe', async () => {
      mockScorecardRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateScorecardDto>()))
        .rejects
        .toThrow(NotFoundException);

      expect(mockScorecardRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debería eliminar un scorecard correctamente', async () => {
      mockScorecardRepository.findOne.mockResolvedValue(scorecardMock);
      mockScorecardRepository.remove.mockResolvedValue(scorecardMock);

      const result = await service.remove(1);

      expect(mockScorecardRepository.remove).toHaveBeenCalledWith(scorecardMock);
      expect(result).toEqual({ message: 'Scorecard #1 eliminado correctamente' });
    });

    it('debería lanzar NotFoundException si el scorecard a eliminar no existe', async () => {
      mockScorecardRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99))
        .rejects
        .toThrow(NotFoundException);

      expect(mockScorecardRepository.remove).not.toHaveBeenCalled();
    });
  });
});