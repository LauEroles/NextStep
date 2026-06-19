import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión tradicional por email' })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa. Devuelve el token JWT.',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado de forma exitosa.' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión mediante Google OAuth' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'usuario@gmail.com' } },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa. Devuelve el token JWT.',
  })
  googleLogin(@Body() body: { email: string }) {
    return this.authService.googleSignIn(body.email);
  }
}
