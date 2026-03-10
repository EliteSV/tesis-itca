import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from '@/modules/companies/companies.service';
import { CompaniesController } from '@/modules/companies/companies.controller';
import {
  Company,
  CompanySchema,
} from '@/modules/companies/schemas/company.schema';
import {
  CompanyInvitation,
  CompanyInvitationSchema,
} from '@/modules/companies/schemas/company-invitation.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import { EmailModule } from '@/modules/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: CompanyInvitation.name, schema: CompanyInvitationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
