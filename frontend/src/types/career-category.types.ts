export interface CareerCategory {
  _id: string;
  name: string;
  description?: string;
  requiredProfessionalHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerCategoryDto {
  name: string;
  description?: string;
  requiredProfessionalHours?: number;
}

export interface UpdateCareerCategoryDto
  extends Partial<CreateCareerCategoryDto> {
  isActive?: boolean;
}

export interface CareerCategoriesResponse {
  data: CareerCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}




