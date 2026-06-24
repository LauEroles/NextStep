import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended'; // ✅ importar MockProxy
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto, UserRoleName } from './dto/create-user.dto';
import { ConflictException, ForbiddenException } from '@nestjs/common';


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

describe('UsersService', () => {
  let service: UsersService;

  let mockUserRepository: MockProxy<Repository<User>>;
  let mockRolesService: MockProxy<RolesService>;

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
  });

  afterEach(() => {

    mockUserRepository.findOneBy.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.find.mockReset();
    mockRolesService.findByName.mockReset();
    mockRolesService.findDefaultRole.mockReset();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear y guardar un usuario', async () => {
    const roleMock = mock<Role>({
      id: 1,
      name: UserRoleName.APPLICANT,
      isDefault: true,
      users: [],
    });

    const createUserDtoMock = mock<CreateUserDto>({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Secret123!",
      roleName: UserRoleName.APPLICANT,
    });

    const newUserMock = mock<User>({
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword123",
      role: roleMock,
      isActive: true,          
      createdAt: new Date(),   
      updatedAt: new Date(),  
    });

    const { password: _, ...expectedResult } = newUserMock;

    mockUserRepository.findOneBy.mockResolvedValue(null);
    mockRolesService.findByName.mockResolvedValue(roleMock);
    mockUserRepository.create.mockReturnValue(newUserMock);
    mockUserRepository.save.mockResolvedValue(newUserMock);

    const result = await service.create(createUserDtoMock);

    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(newUserMock);
    expect(result).not.toHaveProperty('password');
    expect(result).toEqual(expectedResult);
  });

  it('debería lanzar ForbiddenException si el usuario es menor de 18 años', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
        birthDate: '2010-01-01',
      });

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createUserDtoMock))
        .rejects
        .toThrow(ForbiddenException);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debería aceptar un usuario mayor de 18 años', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
        birthDate: '1990-01-01', 
      });

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findDefaultRole.mockResolvedValue(roleMock);
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      const result = await service.create(createUserDtoMock);

      expect(result).not.toHaveProperty('password');
    });

    it('debería hashear la contraseña antes de guardar', async () => {
      const createUserDtoMock = mock<CreateUserDto>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Secret123!',
      });

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockRolesService.findDefaultRole.mockResolvedValue(roleMock);
      mockUserRepository.create.mockReturnValue(userMock);
      mockUserRepository.save.mockResolvedValue(userMock);

      await service.create(createUserDtoMock);

      const createCall = mockUserRepository.create.mock.calls[0][0] as Partial<User>;
      expect(createCall.password).not.toBe('Secret123!');
      expect(createCall.password).toMatch(/^\$2b\$/); 
    });
  });

;
