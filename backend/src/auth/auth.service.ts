import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      user: result,
      token: token,
    };
  }
}
