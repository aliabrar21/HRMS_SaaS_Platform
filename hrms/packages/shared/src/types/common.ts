export type RoleName =
  | 'super_admin'
  | 'hr_admin'
  | 'recruiter'
  | 'manager'
  | 'employee'
  | 'finance'
  | 'it_admin';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  pagination?: PaginationMeta;
}

export interface AuthUser {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  mfaEnabled: boolean;
}
