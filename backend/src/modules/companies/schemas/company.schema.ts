import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

export enum CompanyStatus {
  ACTIVE = 'activa',
  INACTIVE = 'inactiva',
}

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  nit: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  sector?: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  status: CompanyStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  logo?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.index({ nit: 1 });
CompanySchema.index({ status: 1 });
CompanySchema.index({ isActive: 1 });
