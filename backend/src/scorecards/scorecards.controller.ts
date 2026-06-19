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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScorecardsService } from './scorecards.service';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Scorecards (Evaluaciones)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scorecards')
export class ScorecardsController {
  constructor(private readonly scorecardsService: ScorecardsService) {}

  @Roles('recruiter')
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva scorecard (Reclutadores)' })
  create(@Body() createScorecardDto: CreateScorecardDto) {
    return this.scorecardsService.create(createScorecardDto);
  }

  @Roles('recruiter')
  @Get()
  @ApiOperation({
    summary: 'Listar todas las scorecards registradas (Reclutadores)',
  })
  findAll() {
    return this.scorecardsService.findAll();
  }

  @Roles('recruiter', 'applicant')
  @Get('feedback/:feedbackId')
  @ApiOperation({ summary: 'Obtener la scorecard asociada a un feedback' })
  findByFeedback(@Param('feedbackId') feedbackId: string) {
    return this.scorecardsService.findByFeedback(+feedbackId);
  }

  @Roles('recruiter')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una scorecard por ID' })
  findOne(@Param('id') id: string) {
    return this.scorecardsService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
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
  @ApiOperation({
    summary: 'Eliminar una scorecard del sistema (Reclutadores/Admin)',
  })
  remove(@Param('id') id: string) {
    return this.scorecardsService.remove(+id);
  }
}
