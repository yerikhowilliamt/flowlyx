import { useQuery } from '@tanstack/react-query';
import { searchGlobal } from '../api/search.api';

export function useSearch(q: string, limit?: number) {
  return useQuery({
    queryKey: ['global-search', q, limit],
    queryFn: () => searchGlobal(q, limit),
    enabled: typeof q === 'string' && q.trim().length > 0,
  });
}
