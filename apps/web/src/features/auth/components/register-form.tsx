'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterInput, registerSchema } from '../schemas/auth.schema';
import { useRegister } from '../hooks/use-register';
import Link from 'next/link';

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
    <div className="space-y-6 rounded-xl border border-border bg-secondary p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create an Account</h1>
        <p className="text-muted-foreground">Enter your details to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full rounded-md border border-border bg-background p-2"
            placeholder="John Doe"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-border bg-background p-2"
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full rounded-md border border-border bg-background p-2"
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className="w-full rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting || registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
        </button>
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
