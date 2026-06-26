import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
  ApiValidationDocs,
  ApiNotFoundDocs,
} from '../common/decorators/api-docs.decorator';
import { Role } from './entities/role.entity';

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
  @ApiCreatedResponse({
    description:
      'El nuevo rol fue creado y registrado exitosamente en el sistema.',
    type: Role,
  })
  @ApiValidationDocs()
  @ApiOperation({ summary: 'Registrar un nuevo rol en el sistema (Admin)' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Roles('admin')
  @Get()
  @ApiOkResponse({
    description:
      'Lista completa de los roles configurados en el sistema obtenida correctamente.',
    type: [Role],
  })
  @ApiOperation({ summary: 'Listar todos los roles configurados (Admin)' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  @ApiOkResponse({
    description: 'Detalle del rol solicitado obtenido correctamente.',
    type: Role,
  })
  @ApiNotFoundDocs()
  @ApiOperation({ summary: 'Obtener el detalle de un rol específico (Admin)' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }
}
