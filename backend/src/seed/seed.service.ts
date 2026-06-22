import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import { Stage } from '../stages/entities/stage.entity'; 

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Seniority) private readonly seniorityRepo: Repository<Seniority>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async runSeed() {
    this.logger.log('🌱 Iniciando la carga de datos maestros (Seed)...');

    if ((await this.roleRepo.count()) === 0) {
      await this.roleRepo.save([
        { name: 'admin', isDefault: false },
        { name: 'applicant', isDefault: true },
        { name: 'recruiter', isDefault: false },
      ]);
      this.logger.log('✅ Roles insertados.');
    }

    if ((await this.seniorityRepo.count()) === 0) {
      await this.seniorityRepo.save([
        { name: 'Trainee' },
        { name: 'Junior' },
        { name: 'Semi-senior' },
        { name: 'Senior' },
      ]);
      this.logger.log('✅ Seniorities insertadas.');
    }

    if ((await this.stageRepo.count()) === 0) {
      await this.stageRepo.save([
        { name: 'Aplicado', sequenceOrder: 10, isTerminal: false, isHiredStage: false },
        { name: 'Entrevista RRHH', sequenceOrder: 20, isTerminal: false, isHiredStage: false },
        { name: 'Evaluación Técnica', sequenceOrder: 30, isTerminal: false, isHiredStage: false },
        { name: 'Entrevista Final', sequenceOrder: 40, isTerminal: false, isHiredStage: false },
        { name: 'Contratado', sequenceOrder: 100, isTerminal: true, isHiredStage: true },
        { name: 'No avanza', sequenceOrder: 900, isTerminal: true, isHiredStage: false },
        { name: 'Desistido', sequenceOrder: 910, isTerminal: true, isHiredStage: false },
      ]);
      this.logger.log('✅ Etapas de selección insertadas.');
    }

    if ((await this.userRepo.count()) === 0) {
        
      const adminRole = await this.roleRepo.findOne({ where: { name: 'admin' } });
      if (!adminRole) {
        throw new Error('No se encontró el rol de administrador. Verifique la carga de roles.');
      }
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
      
      if (!adminEmail || !adminPassword) {
        throw new Error('Las variables de entorno DEFAULT_ADMIN_EMAIL y DEFAULT_ADMIN_PASSWORD deben estar definidas.');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await this.userRepo.save({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'NextStep',
        isActive: true, 
        role: adminRole,
      });
      this.logger.log('✅ Usuario Administrador creado con éxito.');
      this.logger.log("Sus credenciales de administrador son las que definió en las variables de entorno DEFAULT_ADMIN_EMAIL y DEFAULT_ADMIN_PASSWORD.");
    }

    this.logger.log('🏁 Proceso de Seeding finalizado con éxito.');
  }
}
