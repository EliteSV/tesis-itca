import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from '@/config/app.config';
import { AuthModule } from '@/modules/auth/auth.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { InvitationsModule } from '@/modules/invitations/invitations.module';
import { CareerCategoriesModule } from '@/modules/career-categories/career-categories.module';
import { CareersModule } from '@/modules/careers/careers.module';
import { OpportunitiesModule } from '@/modules/opportunities/opportunities.module';
import { StudentsModule } from '@/modules/students/students.module';
import { UsersModule } from '@/modules/users/users.module';
import { PracticeProfessionalModule } from '@/modules/practice-professional/practice-professional.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('mongodb.uri');
        if (!uri) {
          throw new Error(
            'MONGODB_URI no está configurado en las variables de entorno',
          );
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    DashboardModule,
    CompaniesModule,
    InvitationsModule,
    CareerCategoriesModule,
    CareersModule,
    OpportunitiesModule,
    StudentsModule,
    UsersModule,
    PracticeProfessionalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
