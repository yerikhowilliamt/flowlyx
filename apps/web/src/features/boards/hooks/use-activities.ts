import { useQuery } from '@tanstack/react-query';
import { getActivitiesByEntity, FindActivitiesParams } from '../api/activities.api';

export function useActivities(entityId?: string, params?: FindActivitiesParams) {
  return useQuery({
    queryKey: ['activities', entityId, params],
    queryFn: () => getActivitiesByEntity(entityId!, params),
    enabled: !!entityId,
  });
}
