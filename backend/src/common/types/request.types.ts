import { UserRole } from '@/modules/auth/schemas/user.schema';

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  careerId?: string;
}

export interface AuthenticatedRequest {
  user: RequestUser;
}
