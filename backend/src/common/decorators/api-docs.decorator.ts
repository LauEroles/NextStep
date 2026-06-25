import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export function ApiAuthDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description:
        'No autorizado: El usuario no está autenticado; el token JWT falta, es inválido o expiró.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'No autorizado' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
}

export function ApiRolesDocs() {
  return applyDecorators(
    ApiResponse({
      status: 403,
      description:
        'Prohibido: El usuario no cuenta con el rol o los permisos necesarios.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: {
            type: 'string',
            example: 'No tenés permisos para realizar esta acción.',
          },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
  );
}

export function ApiServerErrorDocs() {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Error interno del servidor' },
          error: { type: 'string', example: 'Internal Server Error' },
        },
      },
    }),
  );
}

export function ApiValidationDocs() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description:
        'Petición incorrecta: Los datos enviados no superaron las validaciones del DTO.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: [
              'El email debe tener formato válido',
              'La contraseña debe tener al menos 8 caracteres',
            ],
          },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  );
}

export function ApiNotFoundDocs() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description:
        'No encontrado: El recurso solicitado con el ID provisto no existe en la base de datos.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: 'No se encontró el recurso solicitado.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
  );
}
