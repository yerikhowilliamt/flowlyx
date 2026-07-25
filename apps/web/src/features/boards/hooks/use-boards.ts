import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoard,
  getLists,
  createList,
  updateList,
  deleteList,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getPriorities,
  createPriority,
  deletePriority,
} from '../api/boards.api';
import {
  CreateBoardInput,
  CreateListInput,
  UpdateListInput,
  CreateTaskInput,
  UpdateTaskInput,
} from '../schemas/board.schema';

// Boards Hooks
export const useBoards = (projectId: string) => {
  return useQuery({
    queryKey: ['boards', { projectId }],
    queryFn: () => getBoards(projectId),
    enabled: !!projectId,
  });
};

export const useBoard = (id: string) => {
  return useQuery({
    queryKey: ['board', id],
    queryFn: () => getBoard(id),
    enabled: !!id,
  });
};

export const useCreateBoard = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardInput) => createBoard(data),
    onSuccess: () => {
      toast.success('Board created successfully');
      queryClient.invalidateQueries({ queryKey: ['boards', { projectId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create board';
      toast.error(message);
    },
  });
};

export const useUpdateBoard = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBoardInput> }) =>
      updateBoard(id, data),
    onSuccess: (_, variables) => {
      toast.success('Board updated successfully');
      queryClient.invalidateQueries({ queryKey: ['board', variables.id] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['boards', { projectId }] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['boards'] });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update board';
      toast.error(message);
    },
  });
};

export const useDeleteBoard = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBoard(id),
    onSuccess: () => {
      toast.success('Board deleted successfully');
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['boards', { projectId }] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['boards'] });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete board';
      toast.error(message);
    },
  });
};

// Lists Hooks
export const useLists = (boardId: string) => {
  return useQuery({
    queryKey: ['lists', { boardId }],
    queryFn: () => getLists(boardId),
    enabled: !!boardId,
  });
};

export const useCreateList = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListInput) => createList(data),
    onSuccess: () => {
      toast.success('Column created successfully');
      queryClient.invalidateQueries({ queryKey: ['lists', { boardId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create column';
      toast.error(message);
    },
  });
};

export const useUpdateList = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListInput }) => updateList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', { boardId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update column';
      toast.error(message);
    },
  });
};

export const useDeleteList = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: () => {
      toast.success('Column deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['lists', { boardId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete column';
      toast.error(message);
    },
  });
};

// Tasks Hooks
export const useTasks = (listId: string) => {
  return useQuery({
    queryKey: ['tasks', { listId }],
    queryFn: () => getTasks(listId),
    enabled: !!listId,
  });
};

export const useCreateTask = (boardId: string, listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: () => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', { listId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      toast.error(message);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => updateTask(id, data),
    onSuccess: () => {
      // Invalidate both source and destination lists if we know them, or just invalidate all tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      toast.error(message);
    },
  });
};

export const useDeleteTask = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks', { listId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(message);
    },
  });
};

export const usePriorities = (projectId: string) => {
  return useQuery({
    queryKey: ['priorities', { projectId }],
    queryFn: () => getPriorities(projectId),
    enabled: !!projectId,
  });
};

export const useCreatePriority = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId?: string; name: string; color: string; order?: number }) => {
      const targetProjectId = data.projectId || projectId;
      if (!targetProjectId) {
        throw new Error('Project ID is required to create a priority');
      }
      return createPriority({
        projectId: targetProjectId,
        name: data.name,
        color: data.color,
        order: data.order,
      });
    },
    onSuccess: (_, variables) => {
      toast.success('Priority created successfully');
      const targetProjectId = variables.projectId || projectId;
      if (targetProjectId) {
        queryClient.invalidateQueries({ queryKey: ['priorities', { projectId: targetProjectId }] });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create priority';
      toast.error(message);
    },
  });
};

export const useDeletePriority = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePriority(id),
    onSuccess: () => {
      toast.success('Priority deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['priorities', { projectId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete priority';
      toast.error(message);
    },
  });
};
