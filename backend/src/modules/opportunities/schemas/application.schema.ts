import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobada',
  ACCEPTED = 'aceptada',
  REJECTED = 'rechazada',
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Opportunity', required: true })
  opportunityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop()
  coverLetter?: string;

  @Prop({
    type: String,
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Number, min: 0, max: 5 })
  matchScore?: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ opportunityId: 1 });
ApplicationSchema.index({ studentId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ opportunityId: 1, studentId: 1 }, { unique: true });

