import { api } from '@/lib/api-client';

export interface SearchTaskResult {
  id: string;
  title: string;
  description: string | null;
  status: string;
  listId: string;
}

export interface SearchProjectResult {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  workspaceId: string;
}

export interface SearchWorkspaceResult {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  organizationId: string;
}

export interface SearchResults {
  tasks: SearchTaskResult[];
  projects: SearchProjectResult[];
  workspaces: SearchWorkspaceResult[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const searchGlobal = async (q: string, limit?: number): Promise<SearchResults> => {
  const query = new URLSearchParams();
  if (q) query.append('q', q);
  if (limit) query.append('limit', String(limit));

  const url = `/search${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<ApiResponse<SearchResults> | SearchResults>(url);

  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<SearchResults>).data;
  }
  return response as SearchResults;
};
