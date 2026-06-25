import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('RolesController', () => {
  let controller: RolesController;
  let mockRolesService: MockProxy<RolesService>;

  const roleMock = mock<Role>({
    id: 1,
    name: 'applicant',
    isDefault: true,
    users: [],
  });

  const roleMock2 = mock<Role>({
    id: 2,
    name: 'recruiter',
    isDefault: false,
    users: [],
  });

  beforeAll(async () => {
    mockRolesService = mock<RolesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RolesController>(RolesController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a rolesService.create con el DTO correcto', async () => {
      const createRoleDtoMock = mock<CreateRoleDto>({
        name: 'applicant',
      });

      mockRolesService.create.mockResolvedValue(roleMock);

      const result = await controller.create(createRoleDtoMock);

      expect(mockRolesService.create).toHaveBeenCalledWith(createRoleDtoMock);
      expect(result).toEqual(roleMock);
    });
  });


  describe('findAll', () => {
    it('debería llamar a rolesService.findAll', async () => {
      const rolesMock = [roleMock, roleMock2];
      mockRolesService.findAll.mockResolvedValue(rolesMock);

      const result = await controller.findAll();

      expect(mockRolesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(rolesMock);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío si no hay roles', async () => {
      mockRolesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería llamar a rolesService.findOne con el id correcto', async () => {
      mockRolesService.findOne.mockResolvedValue(roleMock);

      const result = await controller.findOne('1');

      expect(mockRolesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(roleMock);
    });

    it('debería convertir correctamente distintos ids de string a number', async () => {
      mockRolesService.findOne.mockResolvedValue(roleMock2);

      await controller.findOne('2');

      expect(mockRolesService.findOne).toHaveBeenCalledWith(2);
    });
  });
});