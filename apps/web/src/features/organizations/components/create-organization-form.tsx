'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema, CreateOrganizationInput } from '../schemas/organization.schema';
import { useCreateOrganization } from '../hooks/use-create-organization';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';

export function CreateOrganizationForm() {
  const { mutate: createOrganization, isPending } = useCreateOrganization();
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const name = useWatch({ control, name: 'name', defaultValue: '' });

  useEffect(() => {
    if (!isSlugCustom) {
      setValue('slug', slugify(name), { shouldValidate: true });
    }
  }, [name, setValue, isSlugCustom]);

  const onSubmit = (data: CreateOrganizationInput) => {
    createOrganization(data);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 sm:p-8 backdrop-blur-md">
      <div className="flex flex-col gap-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Organization</h1>
        <p className="text-sm text-zinc-400">
          Set up a new organization tenant workspace for your team
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Organization Name
          </Label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="Acme Corp"
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
            className="w-full border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="acme-corp"
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
            className="w-full border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="A great place to work"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label
            htmlFor="logo_url"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
            Logo URL (Optional)
          </Label>
          <Input
            id="logo_url"
            type="text"
            {...register('logo_url')}
            className="w-full border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-all"
            placeholder="https://example.com/logo.png"
          />
          {errors.logo_url && (
            <p className="text-xs text-red-500 mt-1">{errors.logo_url.message}</p>
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
            'Create Organization'
          )}
        </Button>
      </form>
    </div>
  );
}
