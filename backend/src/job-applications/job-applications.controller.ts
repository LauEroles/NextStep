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
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Roles('applicant')
  @Post()
  create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.jobApplicationsService.create(
      createJobApplicationDto,
      currentUser.id,
    );
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.jobApplicationsService.findAll();
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(+id, updateJobApplicationDto);
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobApplicationsService.remove(+id);
  }
}
