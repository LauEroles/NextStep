import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // password tiene select: false, hay que pedirla explícitamente
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException('Credenciales inválidas');

    // Devolvemos el usuario sin la contraseña
    const { password: _, ...result } = user;
    return result;
  }
}
