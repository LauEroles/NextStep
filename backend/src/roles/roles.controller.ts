import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';

@ApiTags('Roles de Sistema')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo rol en el sistema (Admin)' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Listar todos los roles configurados (Admin)' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un rol específico (Admin)' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }
}
