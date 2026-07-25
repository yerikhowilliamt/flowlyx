'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProjectSchema, UpdateProjectInput } from '../schemas/project.schema';
import { ProjectSummary } from '../types/project.types';
import { useUpdateProject } from '../hooks/use-projects';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface EditProjectFormProps {
  project: ProjectSummary;
  workspaceId: string;
  onSuccess?: () => void;
}

export function EditProjectForm({ project, workspaceId, onSuccess }: EditProjectFormProps) {
  const { mutate: updateProject, isPending } = useUpdateProject(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  });

  const onSubmit = (data: UpdateProjectInput) => {
    updateProject(
      { id: project.id, data },
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
        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="edit-project-name"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Project Name
          </Label>
          <Input
            id="edit-project-name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="E.g., Core API, Frontend App"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="edit-project-description"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Description (Optional)
          </Label>
          <Input
            id="edit-project-description"
            type="text"
            {...register('description')}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="Project details..."
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
