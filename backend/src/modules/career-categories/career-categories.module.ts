import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareerCategoriesService } from '@/modules/career-categories/career-categories.service';
import { CareerCategoriesController } from '@/modules/career-categories/career-categories.controller';
import {
  CareerCategory,
  CareerCategorySchema,
} from '@/modules/career-categories/schemas/career-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerCategory.name, schema: CareerCategorySchema },
    ]),
  ],
  controllers: [CareerCategoriesController],
  providers: [CareerCategoriesService],
  exports: [CareerCategoriesService],
})
export class CareerCategoriesModule {}
