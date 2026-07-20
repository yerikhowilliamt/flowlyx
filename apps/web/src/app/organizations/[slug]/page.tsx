'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationBySlug } from '@/features/organizations/api/organizations.api';
import { WorkspaceList } from '@/features/workspaces/components/workspace-list';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function OrganizationDashboardPage({ params }: PageProps) {
  const { slug } = use(params);

  const {
    data: organization,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['organization', slug],
    queryFn: () => getOrganizationBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
          <p className="font-semibold text-white">Failed to load organization</p>
          <p className="text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Organization not found'}
          </p>
          <Link
            href="/organizations"
            className="flex items-center text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-x-4">
            <Link href="/organizations" className="flex items-center gap-x-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-500 text-white font-black text-xs">
                F
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                Flow<span className="text-orange-500">lyx</span>
              </span>
            </Link>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-x-2 text-sm text-zinc-400">
              <Building2 className="h-4 w-4 text-zinc-500" />
              <span className="font-medium text-zinc-300">{organization.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-x-4">
            <Link
              href="/organizations"
              className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              All Organizations
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-x-4">
            <div className="rounded-2xl bg-orange-500/10 p-3 border border-orange-500/20 text-orange-500">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {organization.name}
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">slug: /{organization.slug}</p>
            </div>
          </div>
        </div>

        {/* Workspaces Section */}
        <div className="space-y-6">
          <WorkspaceList organizationId={organization.id} />
        </div>
      </main>
    </div>
  );
}
