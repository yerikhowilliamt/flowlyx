import { api } from '@/lib/api-client';

export interface UploadFileResponse {
  id: string;
  workspaceId: string;
  projectId?: string;
  uploaderId: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadFile = async (
  file: File,
  workspaceId: string,
  projectId?: string,
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('workspaceId', workspaceId);
  if (projectId) {
    formData.append('projectId', projectId);
  }

  return api.post<UploadFileResponse>('/storage/upload', formData);
};
