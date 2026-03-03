import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CareerDocument = Career & Document;

@Schema({ timestamps: true })
export class Career {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'CareerCategory', required: true })
  categoryId: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  duration?: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CareerSchema = SchemaFactory.createForClass(Career);

CareerSchema.index({ code: 1 });
CareerSchema.index({ categoryId: 1 });
CareerSchema.index({ isActive: 1 });
