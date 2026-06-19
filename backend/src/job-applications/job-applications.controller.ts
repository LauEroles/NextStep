import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@ApiTags('Postulaciones Laborales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Roles('applicant')
  @Post()
  @ApiOperation({
    summary: 'Registrar una postulación a una vacante (Postulantes)',
  })
  create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.jobApplicationsService.create(
      createJobApplicationDto,
      currentUser.id,
    );
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get()
  @ApiOperation({
    summary:
      'Listar todas las postulaciones, opcionalmente filtradas por vacante',
  })
  @ApiQuery({
    name: 'jobOfferId',
    required: false,
    type: Number,
    description: 'ID de la vacante para filtrar',
  })
  findAll(@Query('jobOfferId') jobOfferId?: string) {
    if (jobOfferId) {
      return this.jobApplicationsService.findByJobOffer(+jobOfferId);
    }
    return this.jobApplicationsService.findAll();
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una postulación por ID' })
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar el estado de una postulación' })
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(+id, updateJobApplicationDto);
  }

  @Roles('admin', 'recruiter')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una postulación del sistema' })
  remove(@Param('id') id: string) {
    return this.jobApplicationsService.remove(+id);
  }
}
