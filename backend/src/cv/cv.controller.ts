import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiBody, 
  ApiConsumes, 
  ApiOperation, 
  ApiTags, 
  ApiOkResponse, 
  ApiCreatedResponse 
} from '@nestjs/swagger';
import { CvService } from './cv.service';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiServerErrorDocs,
  ApiAuthDocs,
  ApiRolesDocs,
} from '../common/decorators/api-docs.decorator';
import { CvFile } from './entities/cv-file.entity';

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
  @ApiCreatedResponse({
    description: 'El archivo de currículum fue subido y almacenado correctamente.',
  })
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
  @ApiOkResponse({
    description: 'El currículum más reciente del usuario fue obtenido correctamente.',
    type: CvFile,
  })
  @ApiOperation({ summary: 'Obtener el último CV subido por un usuario específico' })
  getLatest(@Param('userId') userId: number) {
    return this.cvService.getLatestCvByUser(userId);
  }

  @Roles('admin', 'recruiter', 'applicant')
  @Get('user/:userId')
  @ApiOkResponse({
    description: 'Historial completo de CVs asociados al usuario obtenido correctamente.',
    type: [CvFile],
  })
  @ApiOperation({ summary: 'Obtener los CVs asociados a un usuario' })
  getByUser(@Param('userId') userId: number) {
    return this.cvService.getCvsByUser(userId);
  }
}
