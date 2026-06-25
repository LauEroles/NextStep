import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto, UserRoleName } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: MockProxy<UsersService>;

  const userMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    isActive: true,
  });

  beforeAll(async () => {
    mockUsersService = mock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a usersService.create con el DTO correcto', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      });

      mockUsersService.create.mockResolvedValue(userMock as any);

      const result = await controller.create(createUserDtoMock);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDtoMock);
      expect(result).toEqual(userMock);
    });
  });


  describe('findAll', () => {
    it('debería llamar a usersService.findAll', async () => {
      mockUsersService.findAll.mockResolvedValue([userMock]);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([userMock]);
    });
  });


  describe('findOne', () => {
    it('debería llamar a usersService.findOne con el id correcto', async () => {
      mockUsersService.findOne.mockResolvedValue(userMock);

      const result = await controller.findOne('1');

    
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(userMock);
    });
  });


  describe('update', () => {
    it('debería llamar a usersService.update con id y DTO correctos', async () => {
      const updateUserDtoMock = mock<UpdateUserDto>({
        firstName: 'Johnny',
      });

      mockUsersService.update.mockResolvedValue(userMock);

      const result = await controller.update('1', updateUserDtoMock);

      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDtoMock);
      expect(result).toEqual(userMock);
    });
  });

  describe('remove', () => {
    it('debería llamar a usersService.remove con el id correcto', async () => {
      mockUsersService.remove.mockResolvedValue({ message: 'Usuario #1 eliminado correctamente' });

      const result = await controller.remove('1');

      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Usuario #1 eliminado correctamente' });
    });
  });
});