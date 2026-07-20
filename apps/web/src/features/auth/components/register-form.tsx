'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterInput, registerSchema } from '../schemas/auth.schema';
import { useRegister } from '../hooks/use-register';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="flex flex-col gap-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create an Account</h1>
        <p className="text-muted-foreground">Enter your details to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            className="w-full border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="John Doe"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className="w-full border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className="w-full border-zinc-800 bg-zinc-950 p-2 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting || registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
