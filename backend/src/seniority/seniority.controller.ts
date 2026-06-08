import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SeniorityService } from './seniority.service';
import { CreateSeniorityDto } from './dto/create-seniority.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seniority')
export class SeniorityController {
  constructor(private readonly seniorityService: SeniorityService) {}

  @Roles('admin')
  @Post()
  create(@Body() createSeniorityDto: CreateSeniorityDto) {
    return this.seniorityService.create(createSeniorityDto);
  }

  @Roles('admin', 'recruiter')
  @Get()
  findAll() {
    return this.seniorityService.findAll();
  }

  @Roles('admin', 'recruiter')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seniorityService.findOne(+id);
  }
}
