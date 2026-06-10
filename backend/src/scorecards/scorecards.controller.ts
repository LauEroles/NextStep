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
import { ScorecardsService } from './scorecards.service';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scorecards')
export class ScorecardsController {
  constructor(private readonly scorecardsService: ScorecardsService) {}

  @Roles('recruiter', 'admin')
  @Post()
  create(@Body() createScorecardDto: CreateScorecardDto) {
    return this.scorecardsService.create(createScorecardDto);
  }

  @Roles('recruiter', 'admin')
  @Get()
  findAll() {
    return this.scorecardsService.findAll();
  }

  @Roles('recruiter', 'admin')
  @Get('feedback/:feedbackId')
  findByFeedback(@Param('feedbackId') feedbackId: string) {
    return this.scorecardsService.findByFeedback(+feedbackId);
  }

  @Roles('recruiter', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scorecardsService.findOne(+id);
  }

  @Roles('recruiter', 'admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScorecardDto: UpdateScorecardDto) {
    return this.scorecardsService.update(+id, updateScorecardDto);
  }

  @Roles('recruiter', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scorecardsService.remove(+id);
  }
}