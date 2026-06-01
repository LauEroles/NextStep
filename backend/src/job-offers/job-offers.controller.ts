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
import { JobOffersService } from './job-offers.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Roles('recruiter')
  @Post()
  create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOffersService.create(createJobOfferDto);
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get()
  findAll() {
    return this.jobOffersService.findAll();
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobOffersService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ) {
    return this.jobOffersService.update(+id, updateJobOfferDto);
  }

  @Roles('admin', 'recruiter')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobOffersService.remove(+id);
  }
}
