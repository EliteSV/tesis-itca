import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpportunitiesController } from '@/modules/opportunities/opportunities.controller';
import { OpportunitiesService } from '@/modules/opportunities/opportunities.service';
import {
  Opportunity,
  OpportunitySchema,
} from '@/modules/opportunities/schemas/opportunity.schema';
import {
  Application,
  ApplicationSchema,
} from '@/modules/opportunities/schemas/application.schema';
import {
  SavedOpportunity,
  SavedOpportunitySchema,
} from '@/modules/opportunities/schemas/saved-opportunity.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import {
  Student,
  StudentSchema,
} from '@/modules/students/schemas/student.schema';
import { Career, CareerSchema } from '@/modules/careers/schemas/career.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Opportunity.name, schema: OpportunitySchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: SavedOpportunity.name, schema: SavedOpportunitySchema },
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Career.name, schema: CareerSchema },
    ]),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
