'use client';

import Link from 'next/link';
import { useOrganizations } from '../hooks/use-organizations';
import { Loader2, Plus, Building2, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function OrganizationList() {
  const { data: organizations, isLoading, isError, error } = useOrganizations();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
        <p className="font-semibold text-white">Failed to load organizations</p>
        <p className="text-sm text-zinc-400">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 bg-zinc-950 text-zinc-50 min-h-dvh">
      {/* Top Navbar for Console Dashboard */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6">
        <div className="flex items-center gap-x-2">
          <div>
            <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={90} height={26} priority />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 ml-2">
            Console
          </span>
        </div>
        <div className="flex items-center gap-x-4">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Home
          </Link>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="px-6 space-y-8 max-w-5xl mx-auto pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Organizations</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Select an organization dashboard or set up a new tenant workspace.
            </p>
          </div>
          <Link
            href="/organizations/new"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Organization
          </Link>
        </div>

        {!organizations || organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-16 text-center">
            <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
              <Building2 className="h-8 w-8 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No organizations found</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                Flowlyx organizes projects within organization units. Create your first organization
                to begin.
              </p>
            </div>
            <Link
              href="/organizations/new"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link
                key={org.id}
                href={`/organizations/${org.slug}`}
                className="group relative flex flex-col justify-between h-40 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 transition-all hover:border-orange-500/50 hover:bg-zinc-900/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.04)]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2.5">
                      <div className="rounded-lg bg-orange-500/10 p-2 border border-orange-500/20 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-white tracking-tight group-hover:text-orange-500 transition-colors">
                        {org.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-2xs font-semibold text-zinc-400">
                      {org.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-2xs font-semibold text-zinc-500 mt-4 border-t border-zinc-900/60 pt-3">
                  <span>/{org.slug}</span>
                  <span className="inline-flex items-center gap-x-1 text-zinc-400 group-hover:text-white transition-colors">
                    Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
