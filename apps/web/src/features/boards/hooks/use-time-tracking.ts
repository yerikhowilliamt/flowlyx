import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTimeEntriesByTask,
  createTimeEntry,
  stopTimer,
  updateTimeEntry,
  deleteTimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
} from '../api/time-tracking.api';
import { toast } from 'sonner';

export function useTimeEntries(taskId?: string) {
  return useQuery({
    queryKey: ['time-entries', taskId],
    queryFn: () => getTimeEntriesByTask(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateTimeEntry(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateTimeEntryInput, 'taskId'>) => createTimeEntry({ taskId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
      toast.success('Time entry created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create time entry');
    },
  });
}

export function useStopTimer(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stopTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
      toast.success('Timer stopped');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to stop timer');
    },
  });
}

export function useUpdateTimeEntry(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeEntryInput }) => updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
      toast.success('Time entry updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update time entry');
    },
  });
}

export function useDeleteTimeEntry(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
      toast.success('Time entry deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete time entry');
    },
  });
}
