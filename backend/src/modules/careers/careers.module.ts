import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareersService } from '@/modules/careers/careers.service';
import { CareersController } from '@/modules/careers/careers.controller';
import { Career, CareerSchema } from '@/modules/careers/schemas/career.schema';
import {
  CareerCategory,
  CareerCategorySchema,
} from '@/modules/career-categories/schemas/career-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Career.name, schema: CareerSchema },
      { name: CareerCategory.name, schema: CareerCategorySchema },
    ]),
  ],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
