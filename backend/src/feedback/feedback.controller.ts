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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Roles('recruiter')
  @Post()
  create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.feedbackService.create(createFeedbackDto, currentUser.id);
  }


  @Roles('admin', 'recruiter', 'applicant')
  @Get()
  findAll(@Query('applicationId') applicationId?: string) {
    if (applicationId) {
      return this.feedbackService.findByApplication(+applicationId);
    }
    return this.feedbackService.findAll();
  }

  @Roles('applicant')
  @Get('my-feedback')
  findMyFeedback(
    @Query('applicationId') applicationId: string,
    @CurrentUser() currentUser: ActiveUser,
  ) {
    return this.feedbackService.findByApplicationForUser(+applicationId, currentUser.id);
  }


  @Roles('admin', 'recruiter', 'applicant')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Roles('recruiter')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Roles('admin', 'recruiter')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
