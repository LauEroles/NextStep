import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
  ApiNotFoundDocs,
} from '../common/decorators/api-docs.decorator';
import { AuditLog } from './entities/audit-log.entity';

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
  @ApiOkResponse({
    description: 'Historial completo de logs obtenido correctamente.',
    type: [AuditLog],
  })
  @ApiOperation({ summary: 'Obtener historial completo de logs (Solo Admin)' })
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  @ApiNotFoundDocs()
  @ApiOkResponse({
    description: 'Detalle del log obtenido correctamente.',
    type: AuditLog,
  })
  @ApiOperation({ summary: 'Obtener un log específico por ID (Solo Admin)' })
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(+id);
  }
}
