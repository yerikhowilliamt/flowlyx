import { useQuery } from '@tanstack/react-query';
import { getCalendarTasks, GetCalendarParams } from '../api/calendar.api';

export const useCalendarTasks = (params: GetCalendarParams) => {
  return useQuery({
    queryKey: ['calendar', params],
    queryFn: () => getCalendarTasks(params),
    enabled: !!params.workspaceId && !!params.startDate && !!params.endDate,
  });
};
