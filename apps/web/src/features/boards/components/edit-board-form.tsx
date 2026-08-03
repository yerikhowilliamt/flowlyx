'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBoardSchema, CreateBoardInput } from '../schemas/board.schema';
import { BoardSummary } from '../types/board.types';
import { useUpdateBoard } from '../hooks/use-boards';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AiMagicButton } from '@/features/ai/components/ai-magic-button';

interface EditBoardFormProps {
  board: BoardSummary;
  projectId: string;
  onSuccess?: () => void;
}

export function EditBoardForm({ board, projectId, onSuccess }: EditBoardFormProps) {
  const { mutate: updateBoard, isPending } = useUpdateBoard(projectId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      projectId,
      name: board.name,
      description: board.description || '',
    },
  });

  const onSubmit = (data: CreateBoardInput) => {
    updateBoard(
      { id: board.id, data },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('projectId')} value={projectId} />

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="edit-board-name"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Board Name
          </Label>
          <Input
            id="edit-board-name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="E.g., Sprint 1, Q3 Roadmap"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="edit-board-description"
              className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
            >
              Description (Optional)
            </Label>
            <AiMagicButton 
              type="suggest-task"
              inputValue={watch('name')}
              onResult={(res) => {
                const descMatch = res.match(/Description\n([\s\S]*?)\n\nPriority/i);
                if (descMatch && descMatch[1]) {
                  setValue('description', descMatch[1].trim());
                } else {
                  // Fallback
                  setValue('description', res.split('\n')[2] || '');
                }
              }}
            />
          </div>
          <Textarea
            id="edit-board-description"
            rows={3}
            {...register('description')}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all resize-none"
            placeholder="Board purpose..."
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
}
