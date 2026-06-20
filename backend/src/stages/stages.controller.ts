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
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiAuthDocs,
  ApiRolesDocs,
  ApiServerErrorDocs,
} from '../common/decorators/api-docs.decorator';

@ApiTags('Etapas de Selección')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Roles('admin', 'recruiter')
  @Post()
  @ApiOperation({ summary: 'Crear una nueva etapa de selección' })
  create(@Body() createStageDto: CreateStageDto) {
    return this.stagesService.create(createStageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las etapas de selección' })
  findAll() {
    return this.stagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una etapa por ID' })
  findOne(@Param('id') id: string) {
    return this.stagesService.findOne(+id);
  }

  @Roles('admin', 'recruiter')
  @Patch(':id')
  @ApiOperation({ summary: 'Modificar una etapa de selección existente' })
  update(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
    return this.stagesService.update(+id, updateStageDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una etapa del sistema' })
  remove(@Param('id') id: string) {
    return this.stagesService.remove(+id);
  }
}
