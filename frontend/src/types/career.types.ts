export interface Career {
  _id: string;
  code: string;
  name: string;
  categoryId: string | { _id: string; name: string; description?: string };
  description?: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerDto {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  duration?: number;
}

export interface UpdateCareerDto extends Partial<CreateCareerDto> {
  isActive?: boolean;
}

export interface CareersResponse {
  data: Career[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



