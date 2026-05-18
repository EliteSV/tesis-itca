import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { OpportunityDocument } from '@/modules/opportunities/schemas/opportunity.schema';
import type { ApplicationDocument } from '@/modules/opportunities/schemas/application.schema';

export type PracticeProfessionalDocument =
  HydratedDocument<PracticeProfessional>;

export enum PracticeStatus {
  EN_CURSO = 'en_curso',
  FINALIZADA = 'finalizada',
}

@Schema({ timestamps: true })
export class PracticeProfessional {
  @Prop({
    type: Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true,
  })
  applicationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Opportunity', required: true })
  opportunityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({
    type: String,
    enum: PracticeStatus,
    default: PracticeStatus.EN_CURSO,
    required: true,
  })
  status: PracticeStatus;

  @Prop({ type: Date })
  finalizedAt?: Date;

  @Prop()
  earlyTerminationReason?: string;

  @Prop({
    type: {
      qualityAndOrganization: { type: Number, min: 1, max: 5 },
      knowledgeAndApplication: { type: Number, min: 1, max: 5 },
      learningCapacity: { type: Number, min: 1, max: 5 },
      attendanceAndPunctuality: { type: Number, min: 1, max: 5 },
      initiativeAndJudgment: { type: Number, min: 1, max: 5 },
    },
  })
  practiceEvaluation?: {
    qualityAndOrganization: number;
    knowledgeAndApplication: number;
    learningCapacity: number;
    attendanceAndPunctuality: number;
    initiativeAndJudgment: number;
  };

  // Virtual fields — populados con .populate('opportunity') y .populate('application')
  opportunity?: OpportunityDocument;
  application?: ApplicationDocument;

  createdAt: Date;
  updatedAt: Date;
}

export const PracticeProfessionalSchema =
  SchemaFactory.createForClass(PracticeProfessional);

PracticeProfessionalSchema.index({ studentId: 1 });
PracticeProfessionalSchema.index({ opportunityId: 1 });
PracticeProfessionalSchema.index({ companyId: 1 });
PracticeProfessionalSchema.index({ studentId: 1, finalizedAt: 1 });

PracticeProfessionalSchema.virtual('opportunity', {
  ref: 'Opportunity',
  localField: 'opportunityId',
  foreignField: '_id',
  justOne: true,
});

PracticeProfessionalSchema.virtual('application', {
  ref: 'Application',
  localField: 'applicationId',
  foreignField: '_id',
  justOne: true,
});
