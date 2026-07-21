import { api } from '@/lib/api-client';

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  referenceId?: string | null;
  referenceType?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
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

export interface FindNotificationsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isRead?: boolean;
}

export const getNotifications = async (
  params?: FindNotificationsParams,
): Promise<PaginatedResponse<NotificationResponse>> => {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit));
    if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder !== undefined) queryParams.append('sortOrder', params.sortOrder);
    if (params.isRead !== undefined) queryParams.append('isRead', String(params.isRead));
  }

  const response = await api.get<ApiResponse<PaginatedResponse<NotificationResponse>>>(
    `/notifications?${queryParams.toString()}`,
  );
  return response.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id: string): Promise<NotificationResponse> => {
  const response = await api.patch<ApiResponse<NotificationResponse>>(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async (): Promise<{ updated: number }> => {
  const response = await api.patch<ApiResponse<{ updated: number }>>('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete<void>(`/notifications/${id}`);
};
