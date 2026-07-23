export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  type?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemConfigPayload {
  key: string;
  value: string;
  description?: string;
  type?: string;
}

export interface UpdateSystemConfigPayload {
  value?: string;
  description?: string;
  type?: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AdminPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserQueryParams extends AdminPaginationParams {
  role?: UserRole;
  status?: UserStatus;
}

export interface AuditLogQueryParams extends AdminPaginationParams {
  userId?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data: T;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginatedMeta;
  total?: number;
}
