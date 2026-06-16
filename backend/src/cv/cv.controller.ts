import {
  Controller, Post, Get, Param,
  UploadedFile, UseInterceptors, Body,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';
import { multerConfig } from './multer.config';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

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

  @Get('user/:userId')
  async getByUser(@Param('userId') userId: number) {
    return this.cvService.getCvsByUser(userId);
  }
}