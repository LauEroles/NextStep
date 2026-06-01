import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ActiveUser } from './interfaces/active-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userService.findByEmail(email, true);

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    const { password: _, ...result } = user;

    const payload: ActiveUser = { id: user.id, email: user.email, role: user.role.name };

    const token = await this.jwtService.signAsync(payload);

    return {
      user: result,
      token: token,
    };
  }
}
