import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './cv.service';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';

@ApiTags('Currículums (CV)')
@ApiServerErrorDocs()
@ApiAuthDocs()
@ApiRolesDocs()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Roles('applicant')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir un archivo de CV (Postulantes)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF, DOC o DOCX del postulante',
        },
        userId: {
          type: 'number',
          example: 1,
          description: 'ID del usuario dueño del CV',
        },
      },
      required: ['file', 'userId'],
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: number,
  ) {
    const saved = this.cvService.uploadCv(file, userId);
    return {
      message: 'CV subido correctamente',
      data: saved,
    };
  }

  @Roles('admin', 'recruiter', 'applicant') 
  @Get('user/:userId/latest')
  getLatest(@Param('userId') userId: number) {
    return this.cvService.getLatestCvByUser(userId);
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener los CVs asociados a un usuario' })
  getByUser(@Param('userId') userId: number) {
    return this.cvService.getCvsByUser(userId);
  }
}
