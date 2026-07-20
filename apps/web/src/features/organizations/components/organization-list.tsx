'use client';

import Link from 'next/link';
import { useOrganizations } from '../hooks/use-organizations';
import { Loader2, Plus, Building } from 'lucide-react';

export function OrganizationList() {
  const { data: organizations, isLoading, isError, error } = useOrganizations();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
        <p className="font-medium">Failed to load organizations</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">Manage your organizations and workspaces.</p>
        </div>
        <Link
          href="/organizations/new"
          className="flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Link>
      </div>

      {!organizations || organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-border p-12 text-center">
          <div className="rounded-full bg-secondary p-4">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No organizations found</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first organization.
            </p>
          </div>
          <Link
            href="/organizations/new"
            className="flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          >
            Create Organization
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/organizations/${org.slug}`}
              className="flex flex-col space-y-2 rounded-xl border border-border bg-secondary p-6 transition-colors hover:border-orange-500 hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{org.name}</h3>
                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500 ring-1 ring-orange-500/20 ring-inset">
                  {org.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">/{org.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
