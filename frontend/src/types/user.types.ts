import { UserRole } from './auth.types';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  careerId?: string;
  isActive: boolean;
  isTemporaryPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
  careerId?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  isActive?: boolean;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserResponse extends User {
  generatedPassword: string;
}

