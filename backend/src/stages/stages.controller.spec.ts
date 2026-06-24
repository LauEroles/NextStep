import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { StagesController } from './stages.controller';
import { StagesService } from './stages.service';
import { Stage } from './entities/stage.entity';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('StagesController', () => {
  let controller: StagesController;
  let mockStagesService: MockProxy<StagesService>;

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

  beforeAll(async () => {
    mockStagesService = mock<StagesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StagesController],
      providers: [
        {
          provide: StagesService,
          useValue: mockStagesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StagesController>(StagesController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });


  describe('create', () => {
    it('debería llamar a stagesService.create con el DTO correcto', async () => {
      const createStageDtoMock = mock<CreateStageDto>({
        name: 'Postulado',
        sequenceOrder: 1,
        isTerminal: false,
      });

      mockStagesService.create.mockResolvedValue(stageMock);

      const result = await controller.create(createStageDtoMock);

      expect(mockStagesService.create).toHaveBeenCalledWith(createStageDtoMock);
      expect(result).toEqual(stageMock);
    });

    it('debería crear una etapa terminal correctamente', async () => {
      const createStageDtoMock = mock<CreateStageDto>({
        name: 'Finalizado',
        sequenceOrder: 3,
        isTerminal: true,
      });

      const terminalStageMock = mock<Stage>({
        id: 3,
        name: 'Finalizado',
        sequenceOrder: 3,
        isTerminal: true,
      });

      mockStagesService.create.mockResolvedValue(terminalStageMock);

      const result = await controller.create(createStageDtoMock);

      expect(result.isTerminal).toBe(true);
    });
  });

  describe('findAll', () => {
    it('debería llamar a stagesService.findAll', async () => {
      const stagesMock = [stageMock, stageMock2];
      mockStagesService.findAll.mockResolvedValue(stagesMock);

      const result = await controller.findAll();

      expect(mockStagesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(stagesMock);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío si no hay etapas', async () => {
      mockStagesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería llamar a stagesService.findOne con el id correcto', async () => {
      mockStagesService.findOne.mockResolvedValue(stageMock);

      const result = await controller.findOne('1');

      expect(mockStagesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(stageMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockStagesService.findOne.mockResolvedValue(stageMock2);

      await controller.findOne('2');

      expect(mockStagesService.findOne).toHaveBeenCalledWith(2);
    });
  });


  describe('update', () => {
    it('debería llamar a stagesService.update con id y DTO correctos', async () => {
      const updateStageDtoMock = mock<UpdateStageDto>({
        name: 'Entrevista Técnica',
      });

      const updatedStageMock = mock<Stage>({
        ...stageMock,
        name: 'Entrevista Técnica',
      });

      mockStagesService.update.mockResolvedValue(updatedStageMock);

      const result = await controller.update('1', updateStageDtoMock);

      expect(mockStagesService.update).toHaveBeenCalledWith(1, updateStageDtoMock);
      expect(result).toEqual(updatedStageMock);
    });

    it('debería actualizar isTerminal correctamente', async () => {
      const updateStageDtoMock = mock<UpdateStageDto>({
        isTerminal: true,
      });

      const updatedStageMock = mock<Stage>({
        ...stageMock,
        isTerminal: true,
      });

      mockStagesService.update.mockResolvedValue(updatedStageMock);

      const result = await controller.update('1', updateStageDtoMock);

      expect(result.isTerminal).toBe(true);
    });
  });


  describe('remove', () => {
    it('debería llamar a stagesService.remove con el id correcto', async () => {
      mockStagesService.remove.mockResolvedValue(stageMock);

      const result = await controller.remove('1');

      expect(mockStagesService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(stageMock);
    });
  });
});
