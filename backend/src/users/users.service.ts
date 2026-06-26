import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/entities/role.entity';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.findByEmail(createUserDto.email);

    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    if (createUserDto.birthDate) {
      this.validateBirthDate(createUserDto.birthDate);
    }
    let userRole: Role;
    if (createUserDto.roleName) {
      userRole = await this.rolesService.findByName(createUserDto.roleName);
    } else {
      userRole = await this.rolesService.findDefaultRole();
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { roleName: _role, birthDate: _birth, ...userFields } = createUserDto;

    const newUser = this.userRepository.create({
      ...userFields,
      email: userFields.email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });
    await this.userRepository.save(newUser);

    const { password: _pass, ...result } = newUser;
    return result;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`El usuario con el id #${id} no existe`);
    }
    return user;
  }

  async searchByName(searchTerm: string) {
    return await this.userRepository.find({
      where: [
        { firstName: ILike(`%${searchTerm}%`) },
        { lastName: ILike(`%${searchTerm}%`) },
      ],
    });
  }

  async findByEmail(email: string, includePassword = false) {
    const emailLowerCase = email.toLowerCase();
    if (includePassword) {
      return await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email = :email', { email: emailLowerCase })
        .getOne();
    }
    return await this.userRepository.findOneBy({ email: emailLowerCase });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: ActiveUser,
  ) {
    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tenés permisos para modificar este perfil.',
      );
    }
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await this.findByEmail(updateUserDto.email);
      if (emailExists) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    const savedUser = await this.userRepository.save(updatedUser);
    const { password: _pass, ...result } = savedUser;
    return result;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `Usuario #${id} eliminado correctamente` };
  }

  validateBirthDate(date: string) {
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    if (age < 18) {
      throw new ForbiddenException(
        'Debés ser mayor de 18 años para registrarte',
      );
    }
  }
}
