export const UserRole = {
  ADMIN: 'admin',
  COMPANY: 'company',
  ESTUDIANTE: 'estudiante',
  COORDINADOR: 'coordinador',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isTemporaryPassword?: boolean;
  isProfileIncomplete?: boolean;
  careerId?: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  access_token: string;
  user: User & { isTemporaryPassword?: boolean };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  identificationNumber: string;
  password: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  careerId: string;
}

