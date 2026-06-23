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
  ApiCreatedResponse 
} from '@nestjs/swagger';
import { JobOffersService } from './job-offers.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';
import { JobOffer } from './entities/job-offer.entity';

@ApiTags('Vacantes Laborales')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Roles('recruiter')
  @Post()
  @ApiCreatedResponse({ 
    description: 'La vacante laboral fue creada correctamente.',
    type: JobOffer 
  })
  @ApiOperation({ summary: 'Publicar una vacante laboral (Reclutadores)' })
  create(
    @Body() createJobOfferDto: CreateJobOfferDto,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.jobOffersService.create(createJobOfferDto, currentUser.id);
  }

  @Get()
  @ApiOkResponse({ 
    description: 'Listado completo de vacantes obtenido correctamente.',
    type: [JobOffer] 
  })
  @ApiOperation({ summary: 'Obtener el listado completo de vacantes' })
  findAll() {
    return this.jobOffersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ 
    description: 'Detalle de la vacante laboral obtenido con éxito.',
    type: JobOffer 
  })
  @ApiOperation({ summary: 'Obtener el detalle de una vacante por ID' })
  findOne(@Param('id') id: string) {
    return this.jobOffersService.findOne(+id);
  }

  @Roles('recruiter', 'admin')
  @Patch(':id')
  @ApiOkResponse({ 
    description: 'Los datos de la vacante laboral se modificaron correctamente.',
    type: JobOffer 
  })
  @ApiOperation({ summary: 'Modificar los datos de un vacante existente' })
  update(
    @Param('id') id: string,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ) {
    return this.jobOffersService.update(+id, updateJobOfferDto);
  }

  @Roles('admin', 'recruiter')
  @Delete(':id')
  @ApiOkResponse({ 
    description: 'La vacante laboral fue eliminada del sistema correctamente.' 
  })
  @ApiOperation({ summary: 'Eliminar una vacante' })
  remove(@Param('id') id: string) {
    return this.jobOffersService.remove(+id);
  }
}
