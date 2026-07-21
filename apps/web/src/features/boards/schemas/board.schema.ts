import { z } from 'zod';

export const createBoardSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const createListSchema = z.object({
  boardId: z.string().uuid('Invalid board ID'),
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name must be at most 100 characters'),
});

export type CreateListInput = z.infer<typeof createListSchema>;

export const updateListSchema = createListSchema.partial();
export type UpdateListInput = z.infer<typeof updateListSchema>;

export const createTaskSchema = z.object({
  listId: z.string().uuid('Invalid list ID'),
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
