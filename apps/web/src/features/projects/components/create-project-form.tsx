'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectInput } from '../schemas/project.schema';
import { useCreateProject } from '../hooks/use-projects';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';

interface CreateProjectFormProps {
  workspaceId: string;
  onSuccess?: () => void;
}

export function CreateProjectForm({ workspaceId, onSuccess }: CreateProjectFormProps) {
  const { mutate: createProject, isPending } = useCreateProject(workspaceId);
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      workspaceId,
      name: '',
      slug: '',
      description: '',
    },
  });

  const name = watch('name');

  useEffect(() => {
    if (!isSlugCustom) {
      setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, setValue, isSlugCustom]);

  const onSubmit = (data: CreateProjectInput) => {
    createProject(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('workspaceId')} value={workspaceId} />

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Project Name
          </Label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="E.g., Core API, Frontend App"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="slug"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Slug
          </Label>
          <Input
            id="slug"
            type="text"
            {...register('slug', {
              onChange: () => {
                setIsSlugCustom(true);
              },
            })}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="core-api"
          />
          {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="description"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Description (Optional)
          </Label>
          <Input
            id="description"
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
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </form>
    </div>
  );
}
