// src/cv/multer.config.ts
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'cv'),  // carpeta física
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname);            // '.pdf'
      const storedName = `${uuidv4()}${ext}`;           // uuid.pdf
      cb(null, storedName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new BadRequestException('Solo se permiten PDF, DOC o DOCX'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB máximo
};