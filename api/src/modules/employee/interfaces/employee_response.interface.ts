export interface EmployeePagingResponse {
  id: string;
  name: string;
  slug?: string;
  academic_degree: string;
  created_at?: Date;
  updated_at?: Date;
  published: boolean;
}

export interface EmployeeLanguageResponse {
  id: string;
  employee_language_id?: string;
  name: string;
  slug?: string;
  academic_degree: string;
  published: boolean;
  file?: {
    id: string;
    url: string;
    name: string;
    type: string;
  };
}

export interface DeleteEmployeeResponse {
  id: string;
}
