import { api } from '@/lib/api-client';
import {
  AdminUser,
  UpdateUserPayload,
  UserQueryParams,
  SystemConfig,
  CreateSystemConfigPayload,
  UpdateSystemConfigPayload,
  AuditLog,
  AuditLogQueryParams,
  AdminPaginationParams,
  ApiResponse,
  PaginatedResponse,
} from '../types/admin.types';

// Helper to extract data from API response or array/paginated structure
function formatResponse<T>(res: unknown): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res === 'object' && res !== null && 'data' in res) {
    const inner = (res as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
    if (
      inner &&
      typeof inner === 'object' &&
      'data' in inner &&
      Array.isArray((inner as { data: unknown }).data)
    ) {
      return (inner as { data: T[] }).data;
    }
  }
  return [];
}

// Users API
export const getUsers = async (params?: UserQueryParams): Promise<AdminUser[]> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.role) query.append('role', params.role);
  if (params?.status) query.append('status', params.status);

  const url = `/users${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<
    ApiResponse<AdminUser[]> | AdminUser[] | PaginatedResponse<AdminUser>
  >(url);
  return formatResponse<AdminUser>(response);
};

export const getUserById = async (id: string): Promise<AdminUser> => {
  const response = await api.get<ApiResponse<AdminUser> | AdminUser>(`/users/${id}`);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<AdminUser>).data
    : (response as AdminUser);
};

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<AdminUser> => {
  const response = await api.patch<ApiResponse<AdminUser> | AdminUser>(`/users/${id}`, payload);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<AdminUser>).data
    : (response as AdminUser);
};

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete<ApiResponse<{ success: boolean }> | { success: boolean }>(
    `/users/${id}`,
  );
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<{ success: boolean }>).data
    : (response as { success: boolean });
};

// System Configuration API
export const getSystemConfigs = async (params?: AdminPaginationParams): Promise<SystemConfig[]> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);

  const url = `/system-configurations${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<
    ApiResponse<SystemConfig[]> | SystemConfig[] | PaginatedResponse<SystemConfig>
  >(url);
  return formatResponse<SystemConfig>(response);
};

export const getSystemConfigByKey = async (key: string): Promise<SystemConfig> => {
  const response = await api.get<ApiResponse<SystemConfig> | SystemConfig>(
    `/system-configurations/${key}`,
  );
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<SystemConfig>).data
    : (response as SystemConfig);
};

export const createSystemConfig = async (
  payload: CreateSystemConfigPayload,
): Promise<SystemConfig> => {
  const response = await api.post<ApiResponse<SystemConfig> | SystemConfig>(
    '/system-configurations',
    payload,
  );
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<SystemConfig>).data
    : (response as SystemConfig);
};

export const updateSystemConfig = async (
  key: string,
  payload: UpdateSystemConfigPayload,
): Promise<SystemConfig> => {
  const response = await api.patch<ApiResponse<SystemConfig> | SystemConfig>(
    `/system-configurations/${key}`,
    payload,
  );
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<SystemConfig>).data
    : (response as SystemConfig);
};

export const deleteSystemConfig = async (key: string): Promise<{ success: boolean }> => {
  const response = await api.delete<ApiResponse<{ success: boolean }> | { success: boolean }>(
    `/system-configurations/${key}`,
  );
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<{ success: boolean }>).data
    : (response as { success: boolean });
};

// Audit Logs API
export const getAuditLogs = async (params?: AuditLogQueryParams): Promise<AuditLog[]> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.userId) query.append('userId', params.userId);
  if (params?.entityType) query.append('entityType', params.entityType);
  if (params?.action) query.append('action', params.action);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);

  const url = `/audit-logs${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<
    ApiResponse<AuditLog[]> | AuditLog[] | PaginatedResponse<AuditLog>
  >(url);
  return formatResponse<AuditLog>(response);
};

export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  const response = await api.get<ApiResponse<AuditLog> | AuditLog>(`/audit-logs/${id}`);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<AuditLog>).data
    : (response as AuditLog);
};

// Assignment API calls
export const assignUserToOrganization = async (
  userId: string,
  organizationId: string,
  role: string,
) => {
  return api.post(`/users/${userId}/assign-organization`, { organizationId, role });
};

export const assignUserToWorkspace = async (userId: string, workspaceId: string, role: string) => {
  return api.post(`/users/${userId}/assign-workspace`, { workspaceId, role });
};

export const assignUserToProject = async (userId: string, projectId: string, role: string) => {
  return api.post(`/users/${userId}/assign-project`, { projectId, role });
};
