import { of } from 'rxjs';
import { AuditLogsInterceptor } from './audit-logs.interceptor';
import { AuditLogsService } from './audit-logs.service';
import { JwtService } from '@nestjs/jwt';

describe('AuditLogsInterceptor', () => {
  const auditLogsService = { create: jest.fn() };
  const jwtService = { decode: jest.fn() };

  const interceptor = new AuditLogsInterceptor(
    auditLogsService as unknown as AuditLogsService,
    jwtService as unknown as JwtService,
  );

  const createContext = (method: string, url: string, headers = {}, params = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({ method, url, headers, params }),
    }),
  });

  const next = { handle: () => of({ id: 10 }) };

  beforeEach(() => jest.clearAllMocks());

  it('no audita login', (done) => {
    interceptor
      .intercept(createContext('POST', '/auth/login') as any, next)
      .subscribe(() => {
        expect(auditLogsService.create).not.toHaveBeenCalled();
        done();
      });
  });

  it('no audita GET', (done) => {
    interceptor
      .intercept(createContext('GET', '/users') as any, next)
      .subscribe(() => {
        expect(auditLogsService.create).not.toHaveBeenCalled();
        done();
      });
  });

  it('audita POST con token y entity plural', (done) => {
    jwtService.decode.mockReturnValue({ id: 5 });

    interceptor
      .intercept(
        createContext('POST', '/job-offers', { authorization: 'Bearer token' }) as any,
        next,
      )
      .subscribe(() => {
        expect(auditLogsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 5,
            action: 'CREATE',
            entity: 'Job-offer',
            entityId: 10,
          }),
        );
        done();
      });
  });

  it('audita register como User', (done) => {
    interceptor
      .intercept(createContext('POST', '/auth/register') as any, next)
      .subscribe(() => {
        expect(auditLogsService.create).toHaveBeenCalledWith(
          expect.objectContaining({ entity: 'User' }),
        );
        done();
      });
  });
});