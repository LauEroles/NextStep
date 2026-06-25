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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ScorecardsService } from './scorecards.service';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';
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
import { Scorecard } from './entities/scorecard.entity';

@ApiTags('Scorecards (Evaluaciones)')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scorecards')
export class ScorecardsController {
  constructor(private readonly scorecardsService: ScorecardsService) {}

  @Roles('recruiter')
  @Post()
  @ApiCreatedResponse({
    description: 'La scorecard fue registrada correctamente en el sistema.',
    type: Scorecard,
  })
  @ApiValidationDocs()
  @ApiOperation({ summary: 'Registrar una nueva scorecard (Reclutadores)' })
  create(@Body() createScorecardDto: CreateScorecardDto) {
    return this.scorecardsService.create(createScorecardDto);
  }

  @Roles('recruiter')
  @Get()
  @ApiOkResponse({
    description: 'Lista completa de scorecards obtenida correctamente.',
    type: [Scorecard],
  })
  @ApiOperation({
    summary: 'Listar todas las scorecards registradas (Reclutadores)',
  })
  findAll() {
    return this.scorecardsService.findAll();
  }

  @Roles('recruiter', 'applicant')
  @Get('feedback/:feedbackId')
  @ApiOkResponse({
    description: 'Scorecard asociada a feedback encontrada con éxito.',
    type: Scorecard,
  })
  @ApiNotFoundDocs()
  @ApiOperation({ summary: 'Obtener la scorecard asociada a un feedback' })
  findByFeedback(@Param('feedbackId') feedbackId: string) {
    return this.scorecardsService.findByFeedback(+feedbackId);
  }

  @Roles('recruiter')
  @Get(':id')
  @ApiOkResponse({
    description: 'Detalle de la scorecard obtenido correctamente.',
    type: Scorecard,
  })
  @ApiNotFoundDocs()
  @ApiOperation({ summary: 'Obtener el detalle de una scorecard por ID' })
  findOne(@Param('id') id: string) {
    return this.scorecardsService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
  @ApiOkResponse({
    description: 'Los puntajes de la scorecard se modificaron correctamente.',
    type: Scorecard,
  })
  @ApiNotFoundDocs()
  @ApiValidationDocs()
  @ApiOperation({
    summary: 'Modificar los puntajes de una scorecard (Reclutadores)',
  })
  update(
    @Param('id') id: string,
    @Body() updateScorecardDto: UpdateScorecardDto,
  ) {
    return this.scorecardsService.update(+id, updateScorecardDto);
  }

  @Roles('recruiter', 'admin')
  @Delete(':id')
  @ApiOkResponse({
    description: 'La scorecard fue eliminada del sistema correctamente.',
  })
  @ApiNotFoundDocs()
  @ApiOperation({
    summary: 'Eliminar una scorecard del sistema (Reclutadores/Admin)',
  })
  remove(@Param('id') id: string) {
    return this.scorecardsService.remove(+id);
  }
}
