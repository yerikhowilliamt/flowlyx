import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Organization | Flowlyx',
  description: 'Create a new organization workspace',
};

export default function CreateOrganizationPage() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50 py-16 px-4">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Link
            href="/organizations"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Organizations
          </Link>
        </div>
        <CreateOrganizationForm />
      </div>
    </main>
  );
}
