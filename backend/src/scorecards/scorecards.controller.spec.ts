import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { ScorecardsController } from './scorecards.controller';
import { ScorecardsService } from './scorecards.service';
import { Scorecard } from './entities/scorecard.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('ScorecardsController', () => {
  let controller: ScorecardsController;
  let mockScorecardsService: MockProxy<ScorecardsService>;

  const feedbackMock = mock<Feedback>({
    id: 1,
    comment: 'Buen candidato',
    technicalScore: 4,
    softSkillsScore: 3,
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
    mockScorecardsService = mock<ScorecardsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScorecardsController],
      providers: [
        {
          provide: ScorecardsService,
          useValue: mockScorecardsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ScorecardsController>(ScorecardsController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a scorecardsService.create con el DTO correcto', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 1,
        skillName: 'JavaScript',
        score: 4,
        type: 'technical',
      });

      mockScorecardsService.create.mockResolvedValue(scorecardMock);

      const result = await controller.create(createScorecardDtoMock);

      expect(mockScorecardsService.create).toHaveBeenCalledWith(createScorecardDtoMock);
      expect(result).toEqual(scorecardMock);
    });

    it('debería crear un scorecard de soft skills correctamente', async () => {
      const createScorecardDtoMock = mock<CreateScorecardDto>({
        feedbackId: 1,
        skillName: 'Comunicación',
        score: 3,
        type: 'soft',
      });

      mockScorecardsService.create.mockResolvedValue(scorecardMock2);

      const result = await controller.create(createScorecardDtoMock);

      expect(result.type).toBe('soft');
    });
  });


  describe('findAll', () => {
    it('debería llamar a scorecardsService.findAll', async () => {
      const scorecardsMock = [scorecardMock, scorecardMock2];
      mockScorecardsService.findAll.mockResolvedValue(scorecardsMock);

      const result = await controller.findAll();

      expect(mockScorecardsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(scorecardsMock);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío si no hay scorecards', async () => {
      mockScorecardsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByFeedback', () => {
    it('debería llamar a scorecardsService.findByFeedback con el feedbackId correcto', async () => {
      const scorecardsMock = [scorecardMock, scorecardMock2];
      mockScorecardsService.findByFeedback.mockResolvedValue(scorecardsMock);

      const result = await controller.findByFeedback('1');

      expect(mockScorecardsService.findByFeedback).toHaveBeenCalledWith(1);
      expect(result).toEqual(scorecardsMock);
    });

    it('debería retornar array vacío si no hay scorecards para ese feedback', async () => {
      mockScorecardsService.findByFeedback.mockResolvedValue([]);

      const result = await controller.findByFeedback('99');

      expect(result).toEqual([]);
    });

    it('debería convertir correctamente distintos feedbackIds de string a number', async () => {
      mockScorecardsService.findByFeedback.mockResolvedValue([scorecardMock]);

      await controller.findByFeedback('5');

      expect(mockScorecardsService.findByFeedback).toHaveBeenCalledWith(5);
    });
  });

  describe('findOne', () => {
    it('debería llamar a scorecardsService.findOne con el id correcto', async () => {
      mockScorecardsService.findOne.mockResolvedValue(scorecardMock);

      const result = await controller.findOne('1');

      expect(mockScorecardsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(scorecardMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockScorecardsService.findOne.mockResolvedValue(scorecardMock2);

      await controller.findOne('2');

      expect(mockScorecardsService.findOne).toHaveBeenCalledWith(2);
    });
  });


  describe('update', () => {
    it('debería llamar a scorecardsService.update con id y DTO correctos', async () => {
      const updateScorecardDtoMock = mock<UpdateScorecardDto>({
        score: 5,
      });

      const updatedScorecardMock = mock<Scorecard>({
        ...scorecardMock,
        score: 5,
      });

      mockScorecardsService.update.mockResolvedValue(updatedScorecardMock);

      const result = await controller.update('1', updateScorecardDtoMock);

      expect(mockScorecardsService.update).toHaveBeenCalledWith(1, updateScorecardDtoMock);
      expect(result).toEqual(updatedScorecardMock);
    });

    it('debería actualizar el tipo correctamente', async () => {
      const updateScorecardDtoMock = mock<UpdateScorecardDto>({
        type: 'soft',
      });

      const updatedScorecardMock = mock<Scorecard>({
        ...scorecardMock,
        type: 'soft',
      });

      mockScorecardsService.update.mockResolvedValue(updatedScorecardMock);

      const result = await controller.update('1', updateScorecardDtoMock);

      expect(result.type).toBe('soft');
    });
  });


  describe('remove', () => {
    it('debería llamar a scorecardsService.remove con el id correcto', async () => {
      mockScorecardsService.remove.mockResolvedValue({
        message: 'Scorecard #1 eliminado correctamente',
      });

      const result = await controller.remove('1');

      expect(mockScorecardsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Scorecard #1 eliminado correctamente' });
    });
  });
});
