import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.findByEmail(createUserDto.email);
    
    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const { password, ...result } = newUser;
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

    const updatedUser = Object.assign(user, updateUserDto);

    return await this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);

    return { message: `Usuario #${id} eliminado correctamente` };
  }
}
