import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiOkResponse,       
  ApiCreatedResponse   
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiAuthDocs,
  ApiRolesDocs,
  ApiServerErrorDocs,
} from '../common/decorators/api-docs.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import { User } from './entities/user.entity'; 

@ApiTags('Usuarios')
@ApiServerErrorDocs()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ 
    description: 'El usuario fue registrado con éxito en la base de datos.',
    type: User 
  })
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiAuthDocs()
  @ApiRolesDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'recruiter')
  @Get()
  @ApiOkResponse({ 
    description: 'Lista completa de usuarios obtenida correctamente.',
    type: [User] 
  })
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Get('my-info')
  @ApiOkResponse({ 
    description: 'Datos de tu perfil de usuario obtenidos con éxito.',
    type: User 
  })
  @ApiOperation({ summary: 'Obtener la información del usuario actual' })
  findMyInfo(@CurrentUser() currentUser: ActiveUser) {
    return this.usersService.findOne(currentUser.id);
  }

  @ApiAuthDocs()
  @ApiRolesDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOkResponse({ 
    description: 'Usuario encontrado e información de perfil enviada.',
    type: User 
  })
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOkResponse({ 
    description: 'Los datos del usuario fueron modificados correctamente.',
    type: User 
  })
  @ApiOperation({ summary: 'Modificar los datos de un usuario' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.usersService.update(+id, updateUserDto, currentUser);
  }

  @ApiAuthDocs()
  @ApiRolesDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOkResponse({ 
    description: 'El usuario fue eliminado del sistema correctamente.' 
  })
  @ApiOperation({ summary: 'Eliminar un usuario del sistema (Admin)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
