import {
  Controller, Post, Get, Param,
  UploadedFile, UseInterceptors, Body,
  UseGuards, 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';        
import { RolesGuard } from '../auth/guards/roles.guard';            
import { Roles } from '../auth/decorators/roles.decorator';  

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}
  
  @Roles('admin', 'recruiter', 'applicant')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    const saved = await this.cvService.uploadCv(file, userId);
    return {
      message: 'CV subido correctamente',
      data: saved,
    };
  }
  
  @Roles('admin', 'recruiter', 'applicant') 
  @Get('user/:userId/latest')
  async getLatest(@Param('userId') userId: number) {
    return this.cvService.getLatestCvByUser(userId);
  }

  @Roles('admin', 'recruiter', 'applicant') 
  @Get('user/:userId')
  async getByUser(@Param('userId') userId: number) {
    return this.cvService.getCvsByUser(userId);
  }
}