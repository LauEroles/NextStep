import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

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

  const activeUserMock: ActiveUser = {
    id: 1,
    email: 'john@example.com',
    role: 'applicant',
  };

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
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      } as CreateUserDto;

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


  describe('findMyInfo', () => {
    it('debería llamar a usersService.findOne con el id del usuario actual', async () => {
      mockUsersService.findOne.mockResolvedValue(userMock);

      const result = await controller.findMyInfo(activeUserMock);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(activeUserMock.id);
      expect(result).toEqual(userMock);
    });

    it('debería usar el id correcto según el usuario actual', async () => {
      const otherActiveUserMock: ActiveUser = {
        id: 7,
        email: 'jane@example.com',
        role: 'recruiter',
      };

      mockUsersService.findOne.mockResolvedValue(userMock);

      await controller.findMyInfo(otherActiveUserMock);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(7);
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
    it('debería llamar a usersService.update con id, DTO y usuario actual correctos', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Johnny',
      } as UpdateUserDto;

      mockUsersService.update.mockResolvedValue(userMock);

      const result = await controller.update('1', updateUserDtoMock, activeUserMock);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        1,
        updateUserDtoMock,
        activeUserMock,
      );
      expect(result).toEqual(userMock);
    });

    it('debería pasar el usuario actual correcto según quién hace la petición', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Jane',
      } as UpdateUserDto;

      const otherActiveUserMock: ActiveUser = {
        id: 9,
        email: 'admin@example.com',
        role: 'admin',
      };

      mockUsersService.update.mockResolvedValue(userMock);

      await controller.update('2', updateUserDtoMock, otherActiveUserMock);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        2,
        updateUserDtoMock,
        otherActiveUserMock,
      );
    });
  });

  describe('remove', () => {
    it('debería llamar a usersService.remove con el id correcto', async () => {
      mockUsersService.remove.mockResolvedValue({
        message: 'Usuario #1 eliminado correctamente',
      });