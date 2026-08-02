import { api } from '@/lib/api-client';

export interface ChatInput {
  message: string;
  context?: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

export interface SuggestTaskInput {
  description: string;
  projectContext?: string;
}

export interface SuggestTaskResponse {
  title: string;
  description: string;
  suggestedPriority: string;
  subtasks: string[];
}

export interface SummarizeInput {
  content: string;
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
}

export interface GenerateProjectSummaryInput {
  projectId: string;
  includeStats?: boolean;
  focusArea?: 'progress' | 'risks' | 'blockers' | 'all';
}

export interface GenerateSprintPlanInput {
  projectId: string;
  sprintDurationDays?: number;
  maxTasksPerSprint?: number;
  focusArea?: 'velocity' | 'blockers' | 'priorities' | 'all';
}

export interface GenerateTasksInput {
  projectId: string;
  listId: string;
  prompt: string;
  context?: string;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const chatWithAi = async (data: ChatInput): Promise<ChatResponse> => {
  const response = await api.post<unknown>('/ai-assistant/chat', data);
  return unwrap<ChatResponse>(response);
};

export const suggestTask = async (data: SuggestTaskInput): Promise<SuggestTaskResponse> => {
  const response = await api.post<unknown>('/ai-assistant/suggest-task', data);
  return unwrap<SuggestTaskResponse>(response);
};

export const summarizeText = async (data: SummarizeInput): Promise<SummarizeResponse> => {
  const response = await api.post<unknown>('/ai-assistant/summarize', data);
  return unwrap<SummarizeResponse>(response);
};

export const generateProjectSummary = async (data: GenerateProjectSummaryInput) => {
  const response = await api.post<{ success: boolean; message: string; data: unknown }>('/ai-project-summary/generate', data);
  return unwrap<unknown>(response);
};

export const generateSprintPlan = async (data: GenerateSprintPlanInput) => {
  const response = await api.post<{ success: boolean; message: string; data: unknown }>('/ai-sprint-planning/generate', data);
  return unwrap<unknown>(response);
};

export const generateTasks = async (data: GenerateTasksInput) => {
  const response = await api.post<{ success: boolean; message: string; data: unknown }>('/ai-task-generator/generate', data);
  return unwrap<unknown>(response);
};
