import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type SavedOpportunityDocument = SavedOpportunity & Document;

@Schema({ timestamps: true })
export class SavedOpportunity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Opportunity', required: true })
  opportunityId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const SavedOpportunitySchema =
  SchemaFactory.createForClass(SavedOpportunity);

// Índice único para evitar duplicados
SavedOpportunitySchema.index(
  { studentId: 1, opportunityId: 1 },
  { unique: true },
);
