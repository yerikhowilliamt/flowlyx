'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema, CreateOrganizationInput } from '../schemas/organization.schema';
import { useCreateOrganization } from '../hooks/use-create-organization';
import { Loader2 } from 'lucide-react';

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

export function CreateOrganizationForm() {
  const { mutate: createOrganization, isPending } = useCreateOrganization();
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo_url: '',
    },
  });

  const name = watch('name');

  useEffect(() => {
    if (!isSlugCustom) {
      setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, setValue, isSlugCustom]);

  const onSubmit = (data: CreateOrganizationInput) => {
    createOrganization(data);
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="flex flex-col gap-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create Organization</h1>
        <p className="text-muted-foreground">Set up a new organization for your team</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-y-2">
          <label htmlFor="name">Organization Name</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="Acme Corp"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-y-2">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            type="text"
            {...register('slug', {
              onChange: () => {
                setIsSlugCustom(true);
              },
            })}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="acme-corp"
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="flex flex-col gap-y-2">
          <label htmlFor="description">Description (Optional)</label>
          <input
            id="description"
            type="text"
            {...register('description')}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="A great place to work"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <label htmlFor="logo_url">Logo URL (Optional)</label>
          <input
            id="logo_url"
            type="text"
            {...register('logo_url')}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="https://example.com/logo.png"
          />
          {errors.logo_url && <p className="text-sm text-destructive">{errors.logo_url.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Organization'
          )}
        </button>
      </form>
    </div>
  );
}
