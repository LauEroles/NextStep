import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeniorityService } from './seniority.service';
import { CreateSeniorityDto } from './dto/create-seniority.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';

@ApiTags('Seniorities (Niveles de Experiencia)')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seniority')
export class SeniorityController {
  constructor(private readonly seniorityService: SeniorityService) {}

  @Roles('admin', 'recruiter')
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo nivel de seniority' })
  create(@Body() createSeniorityDto: CreateSeniorityDto) {
    return this.seniorityService.create(createSeniorityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los niveles de seniority' })
  findAll() {
    return this.seniorityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un nivel de seniority' })
  findOne(@Param('id') id: string) {
    return this.seniorityService.findOne(+id);
  }
}
