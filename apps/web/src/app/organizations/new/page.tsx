import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Organization | Flowlyx',
  description: 'Create a new organization workspace',
};

export default function CreateOrganizationPage() {
  return (
    <div className="container mx-auto max-w-xl py-10">
      <div className="mb-6">
        <Link
          href="/organizations"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Organizations
        </Link>
      </div>
      <CreateOrganizationForm />
    </div>
  );
}
