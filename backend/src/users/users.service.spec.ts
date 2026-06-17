import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended'; // ✅ importar MockProxy
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto, UserRoleName } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  // ✅ MockProxy te da tipado completo del repositorio
  let mockUserRepository: MockProxy<Repository<User>>;
  let mockRolesService: MockProxy<RolesService>;

  beforeAll(async () => {
    // ✅ Se crean ANTES de pasarlos al módulo
    mockUserRepository = mock<Repository<User>>();
    mockRolesService = mock<RolesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository, // ✅ se inyecta el mock
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
    // ✅ Limpiar llamadas entre tests pero mantener la configuración
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
      isActive: true,          // ✅ faltaba este campo
      createdAt: new Date(),   // ✅ faltaba este campo
      updatedAt: new Date(),   // ✅ faltaba este campo
    });

    const { password: _, ...expectedResult } = newUserMock;

    // ✅ Configurar qué retorna cada método
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
});
