export interface SeedData {
  careerCategories: Array<{
    name: string;
    description: string;
    requiredProfessionalHours: number;
  }>;
  careers: Array<{
    code: string;
    name: string;
    description: string;
    duration: number;
    categoryName?: string;
  }>;
  companies: Array<{
    name: string;
    nit: string;
    address: string;
    phone: string;
    email: string;
    sector: string;
    description: string;
  }>;
  students: Array<{
    firstName: string;
    lastName: string;
    email: string;
    identificationNumber: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    careerCode?: string;
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    activities: string;
    totalHours: number;
    availablePositions: number;
    modality: string;
    workType: string;
    careerCode?: string;
    companyName?: string;
  }>;
}

export interface OpportunityTemplates {
  titles: string[];
  descriptions: string[];
  activities: string[];
}
