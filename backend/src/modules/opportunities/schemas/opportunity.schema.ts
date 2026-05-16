import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { CareerDocument } from '@/modules/careers/schemas/career.schema';
import type { CompanyDocument } from '@/modules/companies/schemas/company.schema';

export type OpportunityDocument = Opportunity & Document;

export enum OpportunityStatus {
  ACTIVE = 'activa',
  CLOSED = 'cerrada',
  DRAFT = 'borrador',
}

export enum OpportunityModality {
  PRESENCIAL = 'presencial',
  REMOTO = 'remoto',
}

export enum OpportunityWorkType {
  PART_TIME = 'part-time',
  FULL_TIME = 'full-time',
}

@Schema({ timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })
export class Opportunity {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  activities?: string;

  @Prop({ type: Types.ObjectId, ref: 'Career', required: true })
  careerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  responsibleUserId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  totalHours: number;

  @Prop({ required: true, min: 1, default: 1 })
  availablePositions: number;

  @Prop({
    type: String,
    enum: OpportunityModality,
  })
  modality?: OpportunityModality;

  @Prop({
    type: String,
    enum: OpportunityWorkType,
  })
  workType?: OpportunityWorkType;

  @Prop()
  expirationDate?: Date;

  @Prop({
    type: String,
    enum: OpportunityStatus,
    default: OpportunityStatus.ACTIVE,
  })
  status: OpportunityStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ unique: true })
  shareToken?: string;

  // Virtual fields — populated via .populate('career') / .populate('company')
  career?: CareerDocument;
  company?: CompanyDocument;

  createdAt: Date;
  updatedAt: Date;
}

export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);

OpportunitySchema.index({ companyId: 1 });
OpportunitySchema.index({ careerId: 1 });
OpportunitySchema.index({ status: 1 });
OpportunitySchema.index({ isActive: 1 });
OpportunitySchema.index({ shareToken: 1 });
OpportunitySchema.index({ responsibleUserId: 1 });
OpportunitySchema.index({ expirationDate: 1 });

OpportunitySchema.virtual('career', {
  ref: 'Career',
  localField: 'careerId',
  foreignField: '_id',
  justOne: true,
});

OpportunitySchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});
