import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationsService } from '@/modules/invitations/invitations.service';
import { InvitationsController } from '@/modules/invitations/invitations.controller';
import {
  CompanyInvitation,
  CompanyInvitationSchema,
} from '@/modules/companies/schemas/company-invitation.schema';
import {
  Company,
  CompanySchema,
} from '@/modules/companies/schemas/company.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyInvitation.name, schema: CompanyInvitationSchema },
      { name: Company.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
