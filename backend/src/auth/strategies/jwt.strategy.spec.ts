import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validate devuelve el payload activo', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(configService);
    const payload = { id: 1, email: 'a@b.com', role: 'applicant' };

    expect(strategy.validate(payload)).toEqual(payload);
  });
});