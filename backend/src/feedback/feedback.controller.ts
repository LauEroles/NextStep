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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';
import { Feedback } from './entities/feedback.entity';

@ApiTags('Feedbacks')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Roles('recruiter')
  @Post()
  @ApiCreatedResponse({
    description: 'El feedback fue registrado correctamente en el sistema.',
    type: Feedback,
  })
  @ApiOperation({
    summary: 'Registrar un nuevo feedback para una etapa (Reclutadores)',
  })
  create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.feedbackService.create(createFeedbackDto, currentUser.id);
  }

  @Roles('admin', 'recruiter')
  @Get()
  @ApiOkResponse({
    description: 'Listado global de feedbacks obtenido correctamente.',
    type: [Feedback],
  })
  @ApiOperation({
    summary: 'Listar feedbacks, opcionalmente filtrados por postulación',
  })
  @ApiQuery({
    name: 'applicationId',
    required: false,
    type: Number,
    description: 'ID de la postulación para filtrar los feedbacks',
  })
  findAll(@Query('applicationId') applicationId?: string) {
    if (applicationId) {
      return this.feedbackService.findByApplication(+applicationId);
    }
    return this.feedbackService.findAll();
  }

  @Roles('recruiter')
  @Get('my-sent-feedbacks')
  @ApiOkResponse({
    description: 'Listado de feedbacks enviados por el recruiter actual.',
    type: [Feedback],
  })
  @ApiOperation({ summary: 'Listar feedbacks enviados por el recruiter actual' })
  findMySentFeedbacks(@CurrentUser() currentUser: ActiveUser) {
    return this.feedbackService.findByRecruiter(currentUser.id);
  }

  @Roles('applicant')
  @Get('my-feedbacks')
  @ApiOkResponse({
    description: 'Listado de tus feedbacks obtenido con éxito.',
    type: [Feedback],
  })
  @ApiOperation({
    summary: 'Listar todos los feedbacks recibidos del postulante',
  })
  findAllMyFeedbacks(@CurrentUser() currentUser: ActiveUser) {
    return this.feedbackService.findAllForApplicant(currentUser.id);
  }

  @Roles('applicant')
  @Get('my-feedback')
  @ApiOkResponse({
    description:
      'Listado de tus feedbacks para la postulación obtenido con éxito.',
    type: [Feedback],
  })
  @ApiOperation({
    summary:
      'Listar los feedbacks del postulante actual para una postulación específica',
  })
  @ApiQuery({
    name: 'applicationId',
    required: true,
    type: Number,
    description: 'ID de la postulación para filtrar tus feedbacks',
  })
  findMyFeedback(
    @Query('applicationId') applicationId: string,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.feedbackService.findByApplicationForApplicant(
      +applicationId,
      currentUser.id,
    );
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get(':id')
  @ApiOkResponse({
    description: 'Detalle del feedback específico obtenido correctamente.',
    type: Feedback,
  })
  @ApiOperation({
    summary: 'Obtener el detalle de un feedback específico por ID',
  })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
  @ApiOkResponse({
    description: 'El feedback especificado se modificó correctamente.',
    type: Feedback,
  })
  @ApiOperation({
    summary: 'Modificar un feedback existente (Reclutadores)',
  })
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Roles('admin', 'recruiter')
  @Delete(':id')
  @ApiOkResponse({
    description: 'El feedback fue eliminado del sistema correctamente.',
  })
  @ApiOperation({
    summary: 'Eliminar un feedback del sistema (Admin/Reclutadores)',
  })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }

  @Roles('recruiter')
  @Post(':id/generate')
  generateFeedbackForOne(@Param('id') id: string) {
    return this.feedbackService.generateFeedbackForOne(+id);
  }
}
