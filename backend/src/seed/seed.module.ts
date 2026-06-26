import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { AppModule } from '../app.module';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Seniority } from '../seniority/entities/seniority.entity';
import { Stage } from '../stages/entities/stage.entity';

@Module({
  imports: [
    AppModule, 
    TypeOrmModule.forFeature([User, Role, Seniority, Stage]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
