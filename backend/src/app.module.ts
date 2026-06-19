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
import { ScorecardsModule } from './scorecards/scorecards.module';
import { CvModule } from './cv/cv.module';
import { AuditLogsInterceptor } from './audit-logs/audit-logs.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

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
    ScorecardsModule,
    CvModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogsInterceptor,
    },
  ],
})
export class AppModule {}
