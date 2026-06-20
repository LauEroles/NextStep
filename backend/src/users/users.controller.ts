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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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

@ApiTags('Usuarios')
@ApiServerErrorDocs()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiAuthDocs()
  @ApiRolesDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'recruiter')
  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Get('my-info')
  @ApiOperation({ summary: 'Obtener la información del usuario actual' })
  findMyInfo(@CurrentUser() currentUser: ActiveUser) {
    return this.usersService.findOne(currentUser.id);
  }

  @ApiAuthDocs()
  @ApiRolesDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
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
  @ApiOperation({ summary: 'Eliminar un usuario del sistema (Admin)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
