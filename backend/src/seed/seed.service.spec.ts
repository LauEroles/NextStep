import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { SeedService } from './seed.service';
import { Role } from '../roles/entities/role.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import { Stage } from '../stages/entities/stage.entity';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

type MockRepository<T extends object> = Partial<jest.Mocked<Repository<T>>> & {
  count: jest.Mock;
  save: jest.Mock;
  findOne?: jest.Mock;
  create?: jest.Mock;
};

describe('SeedService', () => {
  let service: SeedService;
  let roleRepo: MockRepository<Role>;
  let seniorityRepo: MockRepository<Seniority>;
  let stageRepo: MockRepository<Stage>;
  let userRepo: MockRepository<User>;

  beforeEach(() => {
    roleRepo = {
      count: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as MockRepository<Role>;
    seniorityRepo = {
      count: jest.fn(),
      save: jest.fn(),
    } as MockRepository<Seniority>;
    stageRepo = {
      count: jest.fn(),
      save: jest.fn(),
    } as MockRepository<Stage>;
    userRepo = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as MockRepository<User>;

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    service = new SeedService(
      roleRepo as Repository<Role>,
      seniorityRepo as Repository<Seniority>,
      stageRepo as Repository<Stage>,
      userRepo as Repository<User>,
    );
  });

  it('should seed roles, seniorities, stages and create the admin user when the tables are empty', async () => {
    process.env.DEFAULT_ADMIN_EMAIL = 'admin@nextstep.test';
    process.env.DEFAULT_ADMIN_PASSWORD = 'super-secret';

    roleRepo.count.mockResolvedValue(0);
    seniorityRepo.count.mockResolvedValue(0);
    stageRepo.count.mockResolvedValue(0);
    userRepo.count.mockResolvedValue(0);
    roleRepo.findOne!.mockResolvedValue({ id: 1, name: 'admin' });
    userRepo.create!.mockReturnValue({ id: 10, role: { id: 1 } });
    userRepo.save.mockResolvedValue({ id: 10, role: { id: 1 } });

    await service.runSeed();

    expect(roleRepo.save).toHaveBeenCalledWith([
      { name: 'admin', isDefault: false },
      { name: 'applicant', isDefault: true },
      { name: 'recruiter', isDefault: false },
    ]);
    expect(seniorityRepo.save).toHaveBeenCalledWith([
      { name: 'Trainee' },
      { name: 'Junior' },
      { name: 'Semi-senior' },
      { name: 'Senior' },
    ]);
    expect(stageRepo.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Aplicado' }),
        expect.objectContaining({ name: 'Contratado' }),
      ]),
    );
    expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { name: 'admin' } });
    expect(bcrypt.hash).toHaveBeenCalledWith('super-secret', 10);
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@nextstep.test',
        password: 'hashed-password',
        firstName: 'Admin',
        lastName: 'NextStep',
        isActive: true,
      }),
    );
    expect(userRepo.save).toHaveBeenCalled();
  });
});
