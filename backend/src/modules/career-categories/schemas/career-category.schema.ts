import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareerCategoryDocument = CareerCategory & Document;

@Schema({ timestamps: true })
export class CareerCategory {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, default: 0 })
  requiredProfessionalHours: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CareerCategorySchema =
  SchemaFactory.createForClass(CareerCategory);

CareerCategorySchema.index({ name: 1 });
CareerCategorySchema.index({ isActive: 1 });
