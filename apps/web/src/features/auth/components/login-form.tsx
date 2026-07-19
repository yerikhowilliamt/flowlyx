'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginInput, loginSchema } from '../schemas/auth.schema';
import { useLogin } from '../hooks/use-login';
import Link from 'next/link';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-secondary p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          disabled={isSubmitting || loginMutation.isPending}
          className="w-full rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting || loginMutation.isPending ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
