import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PracticeActivityDocument = PracticeActivity & Document;

export enum ActivityStatus {
  PENDING_APPROVAL = 'pendiente_aprobacion',
  APPROVED = 'aprobada',
  REJECTED = 'rechazada',
}

@Schema({ timestamps: true })
export class PracticeActivity {
  @Prop({ type: Types.ObjectId, ref: 'PracticeProfessional', required: true })
  practiceProfessionalId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  activityDate: Date;

  @Prop({ required: true, min: 0 })
  hours: number;

  @Prop({ required: true })
  equipmentOrTool: string;

  @Prop({
    type: String,
    enum: ActivityStatus,
    default: ActivityStatus.PENDING_APPROVAL,
  })
  status: ActivityStatus;

  @Prop()
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PracticeActivitySchema =
  SchemaFactory.createForClass(PracticeActivity);

PracticeActivitySchema.index({ practiceProfessionalId: 1 });
PracticeActivitySchema.index({ status: 1 });
PracticeActivitySchema.index({ practiceProfessionalId: 1, activityDate: 1 });

