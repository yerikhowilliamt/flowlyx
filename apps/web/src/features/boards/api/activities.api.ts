import { api } from '@/lib/api-client';

export interface ActivityUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ActivityItem {
  id: string;
  entityId: string;
  entityType: string;
  userId: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: ActivityUser;
}

export interface FindActivitiesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  entityType?: string;
  action?: string;
  userId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const getActivitiesByEntity = async (
  entityId: string,
  params?: FindActivitiesParams,
): Promise<PaginatedResponse<ActivityItem>> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.sortBy) query.append('sortBy', params.sortBy);
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params?.entityType) query.append('entityType', params.entityType);
  if (params?.action) query.append('action', params.action);
  if (params?.userId) query.append('userId', params.userId);

  const url = `/activities/entity/${entityId}${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<unknown>(url);
  return unwrap<PaginatedResponse<ActivityItem>>(response);
};
