export interface BoardSummary {
  id: string;
  project_id: string;
  name: string;
  status: string;
}

export interface BoardResponse extends BoardSummary {
  description?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ListSummary {
  id: string;
  board_id: string;
  name: string;
  order: number;
  status: string;
}

export interface ListResponse extends ListSummary {
  color?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface TaskSummary {
  id: string;
  listId: string;
  title: string;
  order: number;
  priorityId?: string | null;
  status: string;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface TaskResponse extends TaskSummary {
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface PrioritySummary {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
  status: string;
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
