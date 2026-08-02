'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiSuggestTask, useAiSummarize } from '../hooks/use-ai';

interface AiMagicButtonProps {
  type: 'suggest-task' | 'summarize';
  inputValue: string;
  onResult: (result: string) => void;
  className?: string;
}

export function AiMagicButton({ type, inputValue, onResult, className }: AiMagicButtonProps) {
  const suggestTaskMutation = useAiSuggestTask();
  const summarizeMutation = useAiSummarize();

  const isPending = type === 'suggest-task' ? suggestTaskMutation.isPending : summarizeMutation.isPending;

  const handleClick = async () => {
    if (!inputValue || inputValue.trim() === '') return;

    if (type === 'suggest-task') {
      suggestTaskMutation.mutate(
        { description: inputValue },
        {
          onSuccess: (data) => {
            const resultText = `${data.title}\n\n${data.description}\n\nPriority: ${data.suggestedPriority}\n\nSubtasks:\n${data.subtasks.map((st) => `- ${st}`).join('\n')}`;
            onResult(resultText);
          },
        }
      );
    } else {
      summarizeMutation.mutate(
        { content: inputValue },
        {
          onSuccess: (data) => {
            const resultText = `${data.summary}\n\nKey Points:\n${data.keyPoints.map((kp) => `- ${kp}`).join('\n')}`;
            onResult(resultText);
          },
        }
      );
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-7 px-2 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 ${className || ''}`}
      onClick={handleClick}
      disabled={isPending || !inputValue}
      title={type === 'suggest-task' ? 'Suggest task details' : 'Summarize content'}
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      <span className="ml-1.5 text-xs font-medium">{type === 'suggest-task' ? 'Suggest' : 'Summarize'}</span>
    </Button>
  );
}
