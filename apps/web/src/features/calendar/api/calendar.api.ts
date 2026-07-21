import { api } from '@/lib/api-client';
import { TaskResponse } from '@/features/boards/types/board.types';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface GetCalendarParams {
  workspaceId: string;
  startDate: string;
  endDate: string;
  projectId?: string;
}

export const getCalendarTasks = async (params: GetCalendarParams): Promise<TaskResponse[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('workspaceId', params.workspaceId);
  queryParams.append('startDate', params.startDate);
  queryParams.append('endDate', params.endDate);
  if (params.projectId) {
    queryParams.append('projectId', params.projectId);
  }

  const response = await api.get<ApiResponse<TaskResponse[]>>(
    `/calendar?${queryParams.toString()}`,
  );
  return response.data;
};
