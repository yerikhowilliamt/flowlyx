'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema, CreateWorkspaceInput } from '../schemas/workspace.schema';
import { useCreateWorkspace } from '../hooks/use-workspaces';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';

interface CreateWorkspaceFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function CreateWorkspaceForm({ organizationId, onSuccess }: CreateWorkspaceFormProps) {
  const { mutate: createWorkspace, isPending } = useCreateWorkspace(organizationId);
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      organizationId,
      name: '',
      slug: '',
      description: '',
    },
  });

  const name = useWatch({ control, name: 'name', defaultValue: '' });

  useEffect(() => {
    if (!isSlugCustom) {
      setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, setValue, isSlugCustom]);

  const onSubmit = (data: CreateWorkspaceInput) => {
    createWorkspace(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('organizationId')} value={organizationId} />

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Workspace Name
          </Label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="Development"
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
            placeholder="development"
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
            placeholder="Main development workspace"
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
            'Create Workspace'
          )}
        </Button>
      </form>
    </div>
  );
}
