import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @Req() req: RequestWithUser,
  ) {
    const candidateId = req.user.id;
    return this.jobApplicationsService.create(
      createJobApplicationDto,
      candidateId,
    );
  }

  @Get()
  findAll() {
    return this.jobApplicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.update(+id, updateJobApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobApplicationsService.remove(+id);
  }
}
