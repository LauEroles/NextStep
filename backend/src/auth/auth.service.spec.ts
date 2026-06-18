import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: MockProxy<UsersService>;
  let mockJwtService: MockProxy<JwtService>;

  const roleMock = mock<Role>({
    id: 1,
    name: 'applicant',
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
    mockUsersService = mock<UsersService>();
    mockJwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  }, 30000);

  afterEach(() => {
    mockUsersService.findByEmail.mockReset();
    mockJwtService.signAsync.mockReset();
    jest.restoreAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('signIn', () => {
    it('debería iniciar sesión correctamente', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      const result = await service.signIn('john@example.com', 'Secret123!');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com', true);
      expect(result).toHaveProperty('token', tokenMock);
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('debería generar el token con el payload correcto', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      await service.signIn('john@example.com', 'Secret123!');

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        id: userMock.id,
        email: userMock.email,
        role: userMock.role.name,
      });
    });

    it('debería retornar el usuario sin la password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      const result = await service.signIn('john@example.com', 'Secret123!');

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id', userMock.id);
      expect(result.user).toHaveProperty('email', userMock.email);
      expect(result.user).toHaveProperty('role', roleMock);
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn('noexiste@example.com', 'Secret123!'))
        .rejects
        .toThrow(UnauthorizedException);

      await expect(service.signIn('noexiste@example.com', 'Secret123!'))
        .rejects
        .toThrow('Credenciales inválidas');

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.signIn('john@example.com', 'wrongPassword'))
        .rejects
        .toThrow(UnauthorizedException);

      await expect(service.signIn('john@example.com', 'wrongPassword'))
        .rejects
        .toThrow('Credenciales inválidas');

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('debería buscar el usuario con includePassword en true', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn('john@example.com', 'Secret123!'))
        .rejects
        .toThrow(UnauthorizedException);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com', true);
    });

    it('debería comparar la password correctamente con bcrypt', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      const bcryptSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      await service.signIn('john@example.com', 'Secret123!');

      expect(bcryptSpy).toHaveBeenCalledWith('Secret123!', userMock.password);
    });
  });


  describe('googleSignIn', () => {
    it('debería iniciar sesión con Google correctamente', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      const result = await service.googleSignIn('john@example.com');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com', false);
      expect(result).toHaveProperty('token', tokenMock);
      expect(result).toHaveProperty('user', userMock);
    });

    it('debería generar el token con el payload correcto', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      await service.googleSignIn('john@example.com');

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        id: userMock.id,
        email: userMock.email,
        role: userMock.role.name,
      });
    });

    it('debería retornar el usuario completo en googleSignIn', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);

      const result = await service.googleSignIn('john@example.com');

      expect(result.user).toEqual(userMock);
    });

    it('debería buscar el usuario con includePassword en false', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.googleSignIn('john@example.com'))
        .rejects
        .toThrow(UnauthorizedException);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john@example.com', false);
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.googleSignIn('noexiste@example.com'))
        .rejects
        .toThrow(UnauthorizedException);

      await expect(service.googleSignIn('noexiste@example.com'))
        .rejects
        .toThrow('No existe una cuenta con este email. Registrate primero.');

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('no debería llamar a bcrypt en googleSignIn', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userMock);
      mockJwtService.signAsync.mockResolvedValue(tokenMock);
      const bcryptSpy = jest.spyOn(bcrypt, 'compare');

      await service.googleSignIn('john@example.com');

      expect(bcryptSpy).not.toHaveBeenCalled();
    });
  });
});
