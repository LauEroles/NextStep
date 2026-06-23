import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { 
  ApiBody, 
  ApiOperation, 
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { ApiServerErrorDocs } from '../common/decorators/api-docs.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Autenticación')
@ApiServerErrorDocs()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Autenticación exitosa. Devuelve el token JWT.',
  })
  @ApiOperation({ summary: 'Iniciar sesión por email' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('register')
  @ApiCreatedResponse({
    description: 'Usuario registrado de forma exitosa en el sistema.',
    type: User
  })
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Autenticación exitosa. Devuelve el token JWT.',
  })
  @ApiOperation({ summary: 'Iniciar sesión mediante Google OAuth' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'usuario@gmail.com' } },
      required: ['email'],
    },
  })
  googleLogin(@Body() body: { email: string }) {
    return this.authService.googleSignIn(body.email);
  }
}
