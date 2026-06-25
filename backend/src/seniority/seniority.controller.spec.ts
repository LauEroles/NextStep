import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { SeniorityController } from './seniority.controller';
import { SeniorityService } from './seniority.service';
import { Seniority } from './entities/seniority.entity';
import { CreateSeniorityDto } from './dto/create-seniority.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('SeniorityController', () => {
  let controller: SeniorityController;
  let mockSeniorityService: MockProxy<SeniorityService>;

  const seniorityMock = mock<Seniority>({
    id: 1,
    name: 'junior',
    jobOffers: [],
  });

  const seniorityMock2 = mock<Seniority>({
    id: 2,
    name: 'senior',
    jobOffers: [],
  });

  beforeAll(async () => {
    mockSeniorityService = mock<SeniorityService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeniorityController],
      providers: [
        {
          provide: SeniorityService,
          useValue: mockSeniorityService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SeniorityController>(SeniorityController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });


  describe('create', () => {
    it('debería llamar a seniorityService.create con el DTO correcto', async () => {
      const createSeniorityDtoMock = mock<CreateSeniorityDto>({
        name: 'junior',
      });

      mockSeniorityService.create.mockResolvedValue(seniorityMock);

      const result = await controller.create(createSeniorityDtoMock);

      expect(mockSeniorityService.create).toHaveBeenCalledWith(createSeniorityDtoMock);
      expect(result).toEqual(seniorityMock);
    });
  });


  describe('findAll', () => {
    it('debería llamar a seniorityService.findAll', async () => {
      const senioritiesMock = [seniorityMock, seniorityMock2];
      mockSeniorityService.findAll.mockResolvedValue(senioritiesMock);

      const result = await controller.findAll();

      expect(mockSeniorityService.findAll).toHaveBeenCalled();
      expect(result).toEqual(senioritiesMock);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío si no hay seniorities', async () => {
      mockSeniorityService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería llamar a seniorityService.findOne con el id correcto', async () => {
      mockSeniorityService.findOne.mockResolvedValue(seniorityMock);

      const result = await controller.findOne('1');

      expect(mockSeniorityService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(seniorityMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockSeniorityService.findOne.mockResolvedValue(seniorityMock2);

      await controller.findOne('2');

      expect(mockSeniorityService.findOne).toHaveBeenCalledWith(2);
    });
  });
});