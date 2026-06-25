import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto, UserRoleName } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: MockProxy<Repository<User>>;
  let mockRolesService: MockProxy<RolesService>;

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

  const adminActiveUserMock: ActiveUser = {
    id: 99,
    email: 'admin@example.com',
    role: 'admin',
  };

  const ownerActiveUserMock: ActiveUser = {
    id: 1,
    email: 'john@example.com',
    role: 'applicant',
  };

  const otherActiveUserMock: ActiveUser = {
    id: 2,
    email: 'jane@example.com',
    role: 'applicant',
  };

  beforeAll(async () => {
    mockUserRepository = mock<Repository<User>>();
    mockRolesService = mock<RolesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  }, 30000);

  afterEach(() => {
    mockUserRepository.findOneBy.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.merge.mockReset();
    mockUserRepository.remove.mockReset();
    mockUserRepository.createQueryBuilder.mockReset();
    mockRolesService.findByName.mockReset();
    mockRolesService.findDefaultRole.mockReset();
    jest.clearAllMocks();
  });
  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear y guardar un usuario correctamente', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
        roleName: UserRoleName.APPLICANT,
      } as CreateUserDto;

      const { password: _, ...expectedResult } = userMock;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findByName.mockResolvedValue(roleMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      const result = await service.create(createUserDtoMock);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(userMock);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(expectedResult);
    });

    it('debería normalizar el email a minúsculas al crear', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'Secret123!',
        roleName: UserRoleName.APPLICANT,
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findByName.mockResolvedValue(roleMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      await service.create(createUserDtoMock);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john@example.com' }),
      );
    });

    it('debería usar el rol por defecto si no se envía roleName', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findDefaultRole.mockResolvedValue(roleMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      await service.create(createUserDtoMock);

      expect(mockRolesService.findDefaultRole).toHaveBeenCalled();
      expect(mockRolesService.findByName).not.toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const createUserDtoMock: CreateUserDto = {
        email: 'john@example.com',
        password: 'Secret123!',
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(userMock);

      await expect(service.create(createUserDtoMock))
        .rejects
        .toThrow(ConflictException);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar ForbiddenException si el usuario es menor de 18 años', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
        birthDate: '2010-01-01',
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createUserDtoMock))
        .rejects
        .toThrow(ForbiddenException);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debería aceptar un usuario mayor de 18 años', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
        birthDate: '1990-01-01',
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findDefaultRole.mockResolvedValue(roleMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      const result = await service.create(createUserDtoMock);

      expect(result).not.toHaveProperty('password');
    });

    it('debería hashear la contraseña antes de guardar', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findDefaultRole.mockResolvedValue(roleMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedvalue');
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      await service.create(createUserDtoMock);

      expect(bcrypt.hash).toHaveBeenCalledWith('Secret123!', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: '$2b$10$hashedvalue' }),
      );
    });

    it('no debería incluir roleName ni birthDate en los datos pasados al repositorio', async () => {
      const createUserDtoMock: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
        roleName: UserRoleName.APPLICANT,
        birthDate: '1990-01-01',
      } as CreateUserDto;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findByName.mockResolvedValue(roleMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      await service.create(createUserDtoMock);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ roleName: expect.anything() }),
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ birthDate: expect.anything() }),
      );
    });
  });


  describe('findAll', () => {
    it('debería retornar todos los usuarios', async () => {
      const usersMock = [userMock, mock<User>({ id: 2, email: 'jane@example.com' })];
      mockUserRepository.find.mockResolvedValue(usersMock);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result).toEqual(usersMock);
    });

    it('debería retornar un array vacío si no hay usuarios', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });


  describe('findOne', () => {
    it('debería retornar un usuario por id', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userMock);

      const result = await service.findOne(1);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(userMock);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99))
        .rejects
        .toThrow(NotFoundException);

      await expect(service.findOne(99))
        .rejects
        .toThrow('El usuario con el id #99 no existe');
    });
  });


  describe('searchByName', () => {
    it('debería retornar usuarios que coincidan con el término de búsqueda', async () => {
      const usersMock = [userMock];
      mockUserRepository.find.mockResolvedValue(usersMock);

      const result = await service.searchByName('John');

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: [
          { firstName: expect.anything() },
          { lastName: expect.anything() },
        ],
      });
      expect(result).toEqual(usersMock);
    });

    it('debería retornar array vacío si no hay coincidencias', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.searchByName('zzz');

      expect(result).toEqual([]);
    });
  });


  describe('findByEmail', () => {
    it('debería retornar un usuario por email', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userMock);

      const result = await service.findByEmail('john@example.com');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toEqual(userMock);
    });

    it('debería convertir el email a minúsculas', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userMock);

      await service.findByEmail('JOHN@EXAMPLE.COM');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
    });

    it('debería usar queryBuilder cuando includePassword es true', async () => {
      const queryBuilderMock = {
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(userMock),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilderMock as any);

      const result = await service.findByEmail('john@example.com', true);

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('user.password');
      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith('user.role', 'role');
      expect(result).toEqual(userMock);
    });

    it('debería retornar null si el email no existe', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@example.com');

      expect(result).toBeNull();
    });
  });


  describe('update', () => {
    it('debería permitir que el propio usuario actualice su perfil', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Johnny',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock, firstName: 'Johnny' });
      const { password: _, ...expectedResult } = updatedUserMock;

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      const result = await service.update(1, updateUserDtoMock, ownerActiveUserMock);

      expect(mockUserRepository.merge).toHaveBeenCalledWith(userMock, updateUserDtoMock);
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUserMock);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(expectedResult);
    });

    it('debería permitir que un admin actualice el perfil de otro usuario', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Johnny',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock, firstName: 'Johnny' });

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      const result = await service.update(1, updateUserDtoMock, adminActiveUserMock);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('debería lanzar ForbiddenException si un usuario intenta editar el perfil de otro', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Johnny',
      } as UpdateUserDto;

      await expect(service.update(1, updateUserDtoMock, otherActiveUserMock))
        .rejects
        .toThrow(ForbiddenException);

      await expect(service.update(1, updateUserDtoMock, otherActiveUserMock))
        .rejects
        .toThrow('No tenés permisos para modificar este perfil.');

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el usuario a actualizar no existe', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, mock<UpdateUserDto>(), adminActiveUserMock))
        .rejects
        .toThrow(NotFoundException);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el nuevo email ya está en uso por otro usuario', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        email: 'taken@example.com',
      } as UpdateUserDto;

      const anotherUserMock = mock<User>({ id: 2, email: 'taken@example.com' });

      mockUserRepository.findOneBy
        .mockResolvedValueOnce(userMock) 
        .mockResolvedValueOnce(anotherUserMock); 

      await expect(service.update(1, updateUserDtoMock, ownerActiveUserMock))
        .rejects
        .toThrow(ConflictException);

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('no debería validar el email si no cambia respecto al actual', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        email: 'john@example.com',
        firstName: 'Johnny',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock, firstName: 'Johnny' });

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      await service.update(1, updateUserDtoMock, ownerActiveUserMock);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('debería permitir cambiar el email si no está en uso', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        email: 'newemail@example.com',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock, email: 'newemail@example.com' });

      mockUserRepository.findOneBy
        .mockResolvedValueOnce(userMock) 
        .mockResolvedValueOnce(null); 

      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      const result = await service.update(1, updateUserDtoMock, ownerActiveUserMock);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('debería hashear la nueva contraseña si se envía en el update', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        password: 'NuevaPassword123!',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock });

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$nuevohash');
      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      await service.update(1, updateUserDtoMock, ownerActiveUserMock);

      expect(bcrypt.hash).toHaveBeenCalledWith('NuevaPassword123!', 10);
      expect(updateUserDtoMock.password).toBe('$2b$10$nuevohash');
    });

    it('no debería hashear la contraseña si no se envía en el update', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Johnny',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock });

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      await service.update(1, updateUserDtoMock, ownerActiveUserMock);

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('debería ocultar la password en el resultado final', async () => {
      const updateUserDtoMock: UpdateUserDto = {
        firstName: 'Johnny',
      } as UpdateUserDto;

      const updatedUserMock = mock<User>({ ...userMock, password: 'shouldNotAppear' });

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockUserRepository.merge.mockReturnValue(updatedUserMock);
      mockUserRepository.save.mockResolvedValue(updatedUserMock);

      const result = await service.update(1, updateUserDtoMock, ownerActiveUserMock);

      expect(result).not.toHaveProperty('password');
    });
  });


  describe('remove', () => {
    it('debería eliminar un usuario correctamente', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockUserRepository.remove.mockResolvedValue(userMock);

      const result = await service.remove(1);

      expect(mockUserRepository.remove).toHaveBeenCalledWith(userMock);
      expect(result).toEqual({ message: 'Usuario #1 eliminado correctamente' });
    });

    it('debería lanzar NotFoundException si el usuario a eliminar no existe', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99))
        .rejects
        .toThrow(NotFoundException);

      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });
  });


  describe('validateBirthDate', () => {
    it('debería lanzar ForbiddenException si el usuario es menor de 18', () => {
      expect(() => service.validateBirthDate('2010-01-01'))
        .toThrow(ForbiddenException);

      expect(() => service.validateBirthDate('2010-01-01'))
        .toThrow('Debés ser mayor de 18 años para registrarte');
    });

    it('debería pasar si el usuario tiene exactamente 18 años', () => {
      const today = new Date();
      const date18YearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      ).toISOString().split('T')[0];

      expect(() => service.validateBirthDate(date18YearsAgo)).not.toThrow();
    });

    it('debería pasar si el usuario es mayor de 18 años', () => {
      expect(() => service.validateBirthDate('1990-01-01')).not.toThrow();
    });

    it('debería lanzar ForbiddenException si cumple 18 mañana', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-25'));

      expect(() => service.validateBirthDate('2008-06-26'))
        .toThrow(ForbiddenException);

      jest.useRealTimers();
    });;
  });
});
