import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export function ApiAuthDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description:
        'No autorizado: El usuario no está autenticado; el token JWT falta, es inválido o expiró.',
    }),
  );
}

export function ApiRolesDocs() {
  return applyDecorators(
    ApiResponse({
      status: 403,
      description:
        'Prohibido: El usuario no cuenta con el rol o los permisos necesarios.',
    }),
  );
}

export function ApiServerErrorDocs() {
  return applyDecorators(
    ApiResponse({ status: 500, description: 'Error interno del servidor.' }),
  );
}
