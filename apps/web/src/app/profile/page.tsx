'use client';

import { ProfileForm } from '@/features/profile/components/profile-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-orange-500 selection:text-white">
      <header className="border-b border-zinc-900 bg-zinc-900/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/organizations"
              className="text-zinc-400 hover:text-zinc-50 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Organizations
            </Link>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Flowlyx
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">User Profile</h2>
          <p className="text-zinc-400 mt-1">Update your account details and profile picture.</p>
        </div>

        <ProfileForm />
      </main>
    </div>
  );
}
