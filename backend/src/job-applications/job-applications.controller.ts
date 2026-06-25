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
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
  ApiValidationDocs,
  ApiNotFoundDocs,
} from '../common/decorators/api-docs.decorator';
import { JobApplication } from './entities/job-application.entity';

@ApiTags('Postulaciones Laborales')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Roles('applicant')
  @Post()
  @ApiCreatedResponse({
    description: 'La postulación a la vacante se registró con éxito.',
    type: JobApplication,
  })
  @ApiValidationDocs()
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

  @Roles('recruiter')
  @Get('my-candidates-by-stage')
  @ApiOkResponse({
    description: 'Candidatos agrupados por etapa para el recruiter actual.',
  })
  @ApiOperation({ summary: 'Candidatos por etapa del recruiter actual' })
  findCandidatesByStage(@CurrentUser() currentUser: ActiveUser) {
    return this.jobApplicationsService.findApplicationsByStageForRecruiter(
      currentUser.id,
    );
  }

  @Roles('admin', 'recruiter')
  @Get()
  @ApiOkResponse({
    description: 'Listado global de postulaciones obtenido correctamente.',
    type: [JobApplication],
  })
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

  @Roles('applicant')
  @Get('my-applications')
  @ApiOkResponse({
    description: 'Listado de tus postulaciones personales obtenido con éxito.',
    type: [JobApplication],
  })
  @ApiOperation({ summary: 'Listar las postulaciones del postulante actual' })
  findMyApplications(@CurrentUser() currentUser: ActiveUser) {
    return this.jobApplicationsService.findByApplicant(currentUser.id);
  }

  @Roles('admin', 'recruiter')
  @Get(':id')
  @ApiOkResponse({
    description: 'Detalle completo de la postulación obtenido correctamente.',
    type: JobApplication,
  })
  @ApiNotFoundDocs()
  @ApiOperation({ summary: 'Obtener el detalle de una postulación por ID' })
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(+id, [
      'applicant',
      'jobOffer',
      'currentStage',
    ]);
  }

  @Roles('recruiter')
  @Patch(':id')
  @ApiOkResponse({
    description: 'El estado de la postulación se actualizó correctamente.',
    type: JobApplication,
  })
  @ApiNotFoundDocs()
  @ApiValidationDocs()
  @ApiOperation({ summary: 'Actualizar el estado de una postulación' })
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(+id, updateJobApplicationDto);
  }

  @Roles('admin', 'recruiter')
  @Delete(':id')
  @ApiOkResponse({
    description: 'La postulación fue eliminada del sistema correctamente.',
  })
  @ApiNotFoundDocs()
  @ApiOperation({ summary: 'Eliminar una postulación del sistema' })
  remove(@Param('id') id: string) {
    return this.jobApplicationsService.remove(+id);
  }
}
