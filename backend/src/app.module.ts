import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
// import { JobOffersModule } from './job-offers/job-offers.module';
// import { JobApplicationsModule } from './job-applications/job-applications.module';

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
    // JobOffersModule,
    // JobApplicationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
