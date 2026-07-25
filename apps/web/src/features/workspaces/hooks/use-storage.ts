import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile, UploadFileResponse } from '../api/storage.api';
import { toast } from 'sonner';

export const useUploadFile = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    UploadFileResponse,
    Error,
    { file: File; projectId?: string }
  >({
    mutationFn: ({ file, projectId }) => uploadFile(file, workspaceId, projectId),
    onSuccess: () => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['workspace-files', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-stats', { workspaceId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      toast.error(message);
    },
  });
};
