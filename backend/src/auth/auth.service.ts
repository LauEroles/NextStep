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

    const passMatch = await bcrypt.compare(password, user.password);

    if (!passMatch) throw new UnauthorizedException('Credenciales inválidas');

    const { password: _, ...result } = user;

    const payload: ActiveUser = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      user: result,
      token: token,
    };
  }


  async googleSignIn(email: string) {
    const user = await this.userService.findByEmail(email, false);

    if (!user) {
      throw new UnauthorizedException(
        'No existe una cuenta con este email. Registrate primero.',
      );
    }

    const payload: ActiveUser = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      user,
      token,
    };
  }
}
