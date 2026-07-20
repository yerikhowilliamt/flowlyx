'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema, CreateWorkspaceInput } from '../schemas/workspace.schema';
import { useCreateWorkspace } from '../hooks/use-workspaces';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CreateWorkspaceFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export function CreateWorkspaceForm({ organizationId, onSuccess }: CreateWorkspaceFormProps) {
  const { mutate: createWorkspace, isPending } = useCreateWorkspace(organizationId);
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const name = watch('name');

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('organizationId')} value={organizationId} />

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="Development"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            type="text"
            {...register('slug', {
              onChange: () => {
                setIsSlugCustom(true);
              },
            })}
            className="w-full border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="development"
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            type="text"
            {...register('description')}
            className="w-full border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="Main development workspace"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
