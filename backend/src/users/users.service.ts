import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.findByEmail(createUserDto.email);

    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    let userRole: Role;
    if (createUserDto.role_id) {
      userRole = await this.rolesService.findOne(createUserDto.role_id);

      if (userRole.name === 'admin') {
        throw new ForbiddenException(
          'No tienes permisos para crear una cuenta de administrador.',
        );
      }
    } else {
      userRole = await this.rolesService.findDefaultRole();
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: userRole,
    });

    await this.userRepository.save(newUser);

    const { password: _, ...result } = newUser;
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);

    return await this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);

    return { message: `Usuario #${id} eliminado correctamente` };
  }
}
