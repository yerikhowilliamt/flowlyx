export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface OrganizationResponse extends OrganizationSummary {
  description?: string | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
