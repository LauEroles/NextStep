import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { StagesService } from './stages.service';
import { Stage } from './entities/stage.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

describe('StagesService', () => {
  let service: StagesService;
  let mockStageRepo: MockProxy<Repository<Stage>>;

  const stageMock = mock<Stage>({
    id: 1,
    name: 'Postulado',
    sequenceOrder: 1,
    isTerminal: false,
  });

  const stageMock2 = mock<Stage>({
    id: 2,
    name: 'Entrevista',
    sequenceOrder: 2,
    isTerminal: false,
  });

  const terminalStageMock = mock<Stage>({
    id: 3,
    name: 'Finalizado',
    sequenceOrder: 3,
    isTerminal: true,
  });

  const allStagesMock = [stageMock, stageMock2, terminalStageMock];

  beforeAll(async () => {
    mockStageRepo = mock<Repository<Stage>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StagesService,
        {
          provide: getRepositoryToken(Stage),
          useValue: mockStageRepo,
        },
      ],
    }).compile();

    service = module.get<StagesService>(StagesService);
  }, 30000);

  afterEach(() => {
    mockStageRepo.findOne.mockReset();
    mockStageRepo.find.mockReset();
    mockStageRepo.create.mockReset();
    mockStageRepo.save.mockReset();
    mockStageRepo.merge.mockReset();
    mockStageRepo.remove.mockReset();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

 describe('create', () => {
  it('debería crear una etapa correctamente', async () => {
    const createStageDtoMock: CreateStageDto = {
      name: 'Postulado',
      sequenceOrder: 1,
      isTerminal: false,
    };

    mockStageRepo.create.mockReturnValue(stageMock);
    mockStageRepo.save.mockResolvedValue(stageMock);

    const result = await service.create(createStageDtoMock);

    expect(mockStageRepo.create).toHaveBeenCalledWith(createStageDtoMock);
    expect(mockStageRepo.save).toHaveBeenCalledWith(stageMock);
    expect(result).toEqual(stageMock);
  });

  it('debería crear una etapa terminal correctamente', async () => {
    const createStageDtoMock: CreateStageDto = {
      name: 'Finalizado',
      sequenceOrder: 3,
      isTerminal: true,
    };

    mockStageRepo.create.mockReturnValue(terminalStageMock);
    mockStageRepo.save.mockResolvedValue(terminalStageMock);

    const result = await service.create(createStageDtoMock);

    expect(mockStageRepo.create).toHaveBeenCalledWith(createStageDtoMock);
    expect(result.isTerminal).toBe(true);
    expect(result).toEqual(terminalStageMock);
  });
});

  describe('findAll', () => {
    it('debería retornar todas las etapas ordenadas por sequenceOrder', async () => {
      mockStageRepo.find.mockResolvedValue(allStagesMock);

      const result = await service.findAll();

      expect(mockStageRepo.find).toHaveBeenCalledWith({
        order: { sequenceOrder: 'ASC' },
      });
      expect(result).toHaveLength(3);
      expect(result).toEqual(allStagesMock);
    });

    it('debería retornar un array vacío si no hay etapas', async () => {
      mockStageRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería retornar las etapas en orden ascendente de sequenceOrder', async () => {
      mockStageRepo.find.mockResolvedValue(allStagesMock);

      const result = await service.findAll();

      expect(result[0].sequenceOrder).toBe(1);
      expect(result[1].sequenceOrder).toBe(2);
      expect(result[2].sequenceOrder).toBe(3);
    });
  });

  describe('findOne', () => {
    it('debería retornar una etapa por id', async () => {
      mockStageRepo.findOne.mockResolvedValue(stageMock);

      const result = await service.findOne(1);

      expect(mockStageRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(stageMock);
    });

    it('debería lanzar NotFoundException si la etapa no existe', async () => {
      mockStageRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('No se encontró ninguna etapa.');
    });
  });


  describe('findInitialStage', () => {
    it('debería retornar la etapa inicial correctamente', async () => {
      mockStageRepo.findOne.mockResolvedValue(stageMock);

      const result = await service.findInitialStage();

      expect(mockStageRepo.findOne).toHaveBeenCalledWith({
        where: {},
        order: { sequenceOrder: 'ASC' },
      });
      expect(result).toEqual(stageMock);
    });

    it('debería retornar la etapa con sequenceOrder más bajo', async () => {
      mockStageRepo.findOne.mockResolvedValue(stageMock);

      const result = await service.findInitialStage();

      expect(result.sequenceOrder).toBe(1);
    });

    it('debería lanzar NotFoundException si no hay etapas configuradas', async () => {
      mockStageRepo.findOne.mockResolvedValue(null);

      await expect(service.findInitialStage())
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findInitialStage())
        .rejects
        .toThrow('No se encontraron etapas.');
    });
  });

  describe('update', () => {
    it('debería actualizar una etapa correctamente', async () => {
      const updateStageDtoMock = mock<UpdateStageDto>({
        name: 'Entrevista Técnica',
        sequenceOrder: 2,
        isTerminal: false,
      });

      const updatedStageMock = mock<Stage>({
        ...stageMock,
        name: 'Entrevista Técnica',
      });

      mockStageRepo.findOne.mockResolvedValue(stageMock);
      mockStageRepo.merge.mockReturnValue(updatedStageMock);
      mockStageRepo.save.mockResolvedValue(updatedStageMock);

      const result = await service.update(1, updateStageDtoMock);

      expect(mockStageRepo.merge).toHaveBeenCalledWith(stageMock, updateStageDtoMock);
      expect(mockStageRepo.save).toHaveBeenCalledWith(updatedStageMock);
      expect(result).toEqual(updatedStageMock);
    });

    it('debería actualizar una etapa a terminal correctamente', async () => {
      const updateStageDtoMock = mock<UpdateStageDto>({
        isTerminal: true,
      });

      const updatedStageMock = mock<Stage>({
        ...stageMock,
        isTerminal: true,
      });

      mockStageRepo.findOne.mockResolvedValue(stageMock);
      mockStageRepo.merge.mockReturnValue(updatedStageMock);
      mockStageRepo.save.mockResolvedValue(updatedStageMock);

      const result = await service.update(1, updateStageDtoMock);

      expect(result.isTerminal).toBe(true);
    });

    it('debería lanzar NotFoundException si la etapa a actualizar no existe', async () => {
      mockStageRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateStageDto>()))
        .rejects
        .toThrow(NotFoundException);

      expect(mockStageRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debería eliminar una etapa correctamente', async () => {
      mockStageRepo.findOne.mockResolvedValue(stageMock);
      mockStageRepo.remove.mockResolvedValue(stageMock);

      const result = await service.remove(1);

      expect(mockStageRepo.remove).toHaveBeenCalledWith(stageMock);
      expect(result).toEqual(stageMock);
    });

    it('debería lanzar NotFoundException si la etapa a eliminar no existe', async () => {
      mockStageRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99))
        .rejects
        .toThrow(NotFoundException);

      expect(mockStageRepo.remove).not.toHaveBeenCalled();
    });
  });
});