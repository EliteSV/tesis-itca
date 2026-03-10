import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyInvitationDocument = CompanyInvitation & Document;

@Schema({ timestamps: true })
export class CompanyInvitation {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: false })
  companyId?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  usedBy?: Types.ObjectId;

  @Prop({ type: Date, required: false })
  usedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanyInvitationSchema =
  SchemaFactory.createForClass(CompanyInvitation);

CompanyInvitationSchema.index({ token: 1 }, { unique: true });
CompanyInvitationSchema.index({ companyId: 1 });
CompanyInvitationSchema.index({ expiresAt: 1 });
CompanyInvitationSchema.index({ isUsed: 1 });
