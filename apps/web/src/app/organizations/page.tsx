import { OrganizationList } from '@/features/organizations/components/organization-list';

export const metadata = {
  title: 'Organizations | Flowlyx',
  description: 'Manage your organizations and workspaces',
};

export default function OrganizationsPage() {
  return (
    <div className="container mx-auto max-w-5xl py-10">
      <OrganizationList />
    </div>
  );
}
