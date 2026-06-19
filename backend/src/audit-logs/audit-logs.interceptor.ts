import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogsService } from './audit-logs.service';
import { JwtService } from '@nestjs/jwt';

const METHOD_ACTION_MAP: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

@Injectable()
export class AuditLogsInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const action = METHOD_ACTION_MAP[request.method];
    if (request.url.includes('/auth/login')) {
      return next.handle();
    }
    if (!action) return next.handle();

    return next.handle().pipe(
      tap((responseBody) => {
        let userId: number | null = null;
        const authHeader = request.headers['authorization'];
        if (authHeader) {
          const token = authHeader.split(' ')[1];
          try {
            const payload = this.jwtService.decode(token);
            userId = payload?.id ?? null;
          } catch {
            userId = null;
          }
        }

        const segments = request.url.split('/').filter(Boolean);
        const rawEntity = segments[0] ?? 'unknown';
        let entity = rawEntity.endsWith('s')
          ? rawEntity.charAt(0).toUpperCase() + rawEntity.slice(1, -1)
          : rawEntity.charAt(0).toUpperCase() + rawEntity.slice(1);
        if (request.url === '/auth/register') {
          entity = 'User';
        }
        const entity_id = String(responseBody?.id ?? request.params?.id ?? '');

        this.auditLogsService.create({ userId, action, entity, entity_id });
      }),
    );
  }
}
