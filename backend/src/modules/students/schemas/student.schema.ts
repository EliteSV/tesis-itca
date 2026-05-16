import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

export enum StudentStatus {
  PERFIL_INCOMPLETO = 'PERFIL INCOMPLETO',
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  GRADUADO = 'GRADUADO',
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  identificationNumber: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  gender?: string;

  @Prop({ type: Types.ObjectId, ref: 'Career', required: true })
  careerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: StudentStatus,
    default: StudentStatus.PERFIL_INCOMPLETO,
  })
  status: StudentStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: {
      fileData: String,
      fileName: String,
      isValidated: Boolean,
      validatedAt: Date,
      validationErrors: [String],
      validationWarnings: [String],
      hasValidStamp: Boolean,
      hasValidFormat: Boolean,
    },
    required: false,
  })
  socialServiceDocument?: {
    fileData: string;
    fileName: string;
    isValidated: boolean;
    validatedAt?: Date;
    validationErrors?: string[];
    validationWarnings?: string[];
    hasValidStamp?: boolean;
    hasValidFormat?: boolean;
  };

  @Prop({
    type: {
      fileData: String,
      fileName: String,
      isValidated: Boolean,
      validatedAt: Date,
      validationErrors: [String],
      validationWarnings: [String],
      hasValidFormat: Boolean,
      passedSubjects: [
        {
          cycle: String,
          code: String,
          subject: String,
        },
      ],
      totalSubjects: Number,
      passedCount: Number,
      validationAccuracyPercent: Number,
    },
    required: false,
  })
  passedSubjectsDocument?: {
    fileData: string;
    fileName: string;
    isValidated: boolean;
    validatedAt?: Date;
    validationErrors?: string[];
    validationWarnings?: string[];
    hasValidFormat?: boolean;
    passedSubjects?: Array<{
      cycle: string;
      code: string;
      subject: string;
    }>;
    totalSubjects?: number;
    passedCount?: number;
    validationAccuracyPercent?: number;
  };

  @Prop({
    type: {
      fileData: String,
      fileName: String,
      isValidated: Boolean,
      validatedAt: Date,
      validationErrors: [String],
      validationWarnings: [String],
      documentStudentName: String,
      documentIdentificationNumber: String,
      cycle: String,
      enrolledSubjects: [
        {
          name: String,
          code: String,
          startDate: String,
          endDate: String,
        },
      ],
    },
    required: false,
  })
  enrollmentProofDocument?: {
    fileData: string;
    fileName: string;
    isValidated: boolean;
    validatedAt?: Date;
    validationErrors?: string[];
    validationWarnings?: string[];
    documentStudentName?: string;
    documentIdentificationNumber?: string;
    cycle?: string;
    enrolledSubjects?: Array<{
      name: string;
      code?: string;
      startDate?: string;
      endDate?: string;
    }>;
  };

  @Prop({
    type: [
      {
        company: String,
        position: String,
        description: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
      },
    ],
    required: false,
    default: [],
  })
  workExperience?: Array<{
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
  }>;

  @Prop({
    type: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        description: String,
      },
    ],
    required: false,
    default: [],
  })
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
    description?: string;
  }>;

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  skills?: string[];

  @Prop({
    type: {
      summary: String,
      languages: [
        {
          name: String,
          level: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          date: Date,
          expiryDate: Date,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String,
        },
      ],
    },
    required: false,
  })
  professionalProfile?: {
    summary?: string;
    languages?: Array<{
      name: string;
      level: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      date: Date;
      expiryDate?: Date;
    }>;
    projects?: Array<{
      name: string;
      description?: string;
      technologies?: string[];
      url?: string;
    }>;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.index({ email: 1 });
StudentSchema.index({ identificationNumber: 1 });
StudentSchema.index({ careerId: 1 });
StudentSchema.index({ status: 1 });
StudentSchema.index({ userId: 1 });
StudentSchema.index({ isActive: 1 });
