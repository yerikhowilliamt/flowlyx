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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="container mx-auto max-w-5xl py-10 px-4">
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
          <p className="font-medium">Failed to load organization</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : 'Organization not found'}
          </p>
          <Link
            href="/organizations"
            className="flex items-center text-sm font-medium hover:underline text-orange-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4 space-y-8">
      {/* Navigation / Header */}
      <div className="flex flex-col gap-y-4">
        <Link
          href="/organizations"
          className="flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Organizations
        </Link>

        <div className="flex items-center gap-x-4 border-b border-zinc-800 pb-6">
          <div className="rounded-xl bg-orange-500/10 p-3 border border-orange-500/20">
            <Building2 className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{organization.name}</h1>
            <p className="text-sm text-zinc-400">Slug: /{organization.slug}</p>
          </div>
        </div>
      </div>

      {/* Workspace List Section */}
      <WorkspaceList organizationId={organization.id} />
    </div>
  );
}
