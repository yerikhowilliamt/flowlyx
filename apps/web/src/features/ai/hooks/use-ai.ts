import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { suggestTask, summarizeText, chatWithAi, generateProjectSummary, generateSprintPlan, generateTasks, SuggestTaskInput, SummarizeInput, ChatInput, GenerateProjectSummaryInput, GenerateSprintPlanInput, GenerateTasksInput } from '../api/ai.api';

export const useAiSuggestTask = () => {
  return useMutation({
    mutationFn: (data: SuggestTaskInput) => suggestTask(data),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to get task suggestion');
    },
  });
};

export const useAiSummarize = () => {
  return useMutation({
    mutationFn: (data: SummarizeInput) => summarizeText(data),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to summarize text');
    },
  });
};

export const useAiChat = () => {
  return useMutation({
    mutationFn: (data: ChatInput) => chatWithAi(data),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    },
  });
};

export const useAiProjectSummary = () => {
  return useMutation({
    mutationFn: (data: GenerateProjectSummaryInput) => generateProjectSummary(data),
    onSuccess: () => {
      toast.success('Project summary generated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate project summary');
    },
  });
};

export const useAiSprintPlan = () => {
  return useMutation({
    mutationFn: (data: GenerateSprintPlanInput) => generateSprintPlan(data),
    onSuccess: () => {
      toast.success('Sprint plan generated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate sprint plan');
    },
  });
};

export const useAiTaskGenerator = () => {
  return useMutation({
    mutationFn: (data: GenerateTasksInput) => generateTasks(data),
    onSuccess: () => {
      toast.success('Tasks generated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate tasks');
    },
  });
};
