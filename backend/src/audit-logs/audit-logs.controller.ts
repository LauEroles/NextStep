import { Controller, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';

@ApiTags('Auditoría')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Obtener historial completo de logs (Solo Admin)' })
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un log específico por ID (Solo Admin)' })
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(+id);
  }
}
