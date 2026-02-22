import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  ESTUDIANTE = 'estudiante',
  COORDINADOR = 'coordinador',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: false })
  companyId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Career', required: false })
  careerId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isTemporaryPassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ companyId: 1 });
UserSchema.index({ careerId: 1 });
