import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobOffersModule } from './job-offers/job-offers.module';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { StagesModule } from './stages/stages.module';
import { SeniorityModule } from './seniority/seniority.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: true,
      extra: {
        ssl: { rejectUnauthorized: false },
      },
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    FeedbackModule,
    AuthModule,
    JobOffersModule,
    JobApplicationsModule,
    RolesModule,
    StagesModule,
    SeniorityModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
