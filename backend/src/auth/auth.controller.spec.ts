import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { SignInDto } from './dto/signIn.dto';
import { CreateUserDto, UserRoleName } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: MockProxy<AuthService>;
  let mockUsersService: MockProxy<UsersService>;


  const roleMock = mock<Role>({
    id: 1,
    name: UserRoleName.APPLICANT,
    isDefault: true,
    users: [],
  });

  const userMock = mock<User>({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: roleMock,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const tokenMock = 'jwt.token.mock';

  beforeAll(async () => {
    mockAuthService = mock<AuthService>();
    mockUsersService = mock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });


  describe('signIn', () => {
    it('debería llamar a authService.signIn con el email y password correctos', async () => {
      const signInDtoMock = mock<SignInDto>({
        email: 'john@example.com',
        password: 'Secret123!',
      });

      const { password: _, ...userWithoutPassword } = userMock;
      const signInResponseMock = {
        user: userWithoutPassword,
        token: tokenMock,
      };

      mockAuthService.signIn.mockResolvedValue(signInResponseMock);

      const result = await controller.signIn(signInDtoMock);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'john@example.com',
        'Secret123!',
      );
      expect(result).toEqual(signInResponseMock);
    });

    it('debería retornar el token y el usuario en la respuesta', async () => {
      const signInDtoMock = mock<SignInDto>({
        email: 'john@example.com',
        password: 'Secret123!',
      });

      const { password: _, ...userWithoutPassword } = userMock;
      mockAuthService.signIn.mockResolvedValue({
        user: userWithoutPassword,
        token: tokenMock,
      });

      const result = await controller.signIn(signInDtoMock);

      expect(result).toHaveProperty('token', tokenMock);
      expect(result).toHaveProperty('user');
    });

    it('debería propagar el error si authService.signIn lanza una excepción', async () => {
      const signInDtoMock = mock<SignInDto>({
        email: 'noexiste@example.com',
        password: 'wrongPassword',
      });

      mockAuthService.signIn.mockRejectedValue(
        new Error('Credenciales inválidas'),
      );

      await expect(controller.signIn(signInDtoMock))
        .rejects
        .toThrow('Credenciales inválidas');
    });
  });

  describe('register', () => {
    it('debería llamar a usersService.create con el DTO correcto', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      });

      const { password: _, ...expectedResult } = userMock;
      mockUsersService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.register(createUserDtoMock);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDtoMock);
      expect(result).toEqual(expectedResult);
    });

    it('debería retornar el usuario creado sin password', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'Secret456!',
      });

      const { password: _, ...expectedResult } = userMock;
      mockUsersService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.register(createUserDtoMock);

      expect(result).not.toHaveProperty('password');
    });

    it('debería propagar el error si usersService.create lanza una excepción', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      });

      mockUsersService.create.mockRejectedValue(
        new Error('El correo electrónico ya está registrado'),
      );

      await expect(controller.register(createUserDtoMock))
        .rejects
        .toThrow('El correo electrónico ya está registrado');
    });
  });

  describe('googleLogin', () => {
    it('debería llamar a authService.googleSignIn con el email correcto', async () => {
      mockAuthService.googleSignIn.mockResolvedValue({
        user: userMock,
        token: tokenMock,
      });

      const result = await controller.googleLogin({ email: 'john@example.com' });

      expect(mockAuthService.googleSignIn).toHaveBeenCalledWith('john@example.com');
      expect(result).toEqual({ user: userMock, token: tokenMock });
    });

    it('debería retornar el token y el usuario completo (sin omitir password)', async () => {
      mockAuthService.googleSignIn.mockResolvedValue({
        user: userMock,
        token: tokenMock,
      });

      const result = await controller.googleLogin({ email: 'john@example.com' });

      expect(result).toHaveProperty('token', tokenMock);
      expect(result.user).toEqual(userMock);
    });

    it('debería propagar el error si authService.googleSignIn lanza una excepción', async () => {
      mockAuthService.googleSignIn.mockRejectedValue(
        new Error('No existe una cuenta con este email. Registrate primero.'),
      );

      await expect(controller.googleLogin({ email: 'noexiste@example.com' }))
        .rejects
        .toThrow('No existe una cuenta con este email. Registrate primero.');
    });
  });
});