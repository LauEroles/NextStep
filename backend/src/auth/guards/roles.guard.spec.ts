import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const createContext = (user?: { role?: string }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('permite acceso si no hay roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('lanza si no hay usuario o rol', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
    expect(() => guard.canActivate(createContext({}))).toThrow(ForbiddenException);
  });

  it('lanza si el rol no coincide', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(createContext({ role: 'applicant' }))).toThrow(ForbiddenException);
  });

  it('permite si el rol coincide', () => {
    reflector.getAllAndOverride.mockReturnValue(['recruiter']);
    expect(guard.canActivate(createContext({ role: 'recruiter' }))).toBe(true);
  });
});