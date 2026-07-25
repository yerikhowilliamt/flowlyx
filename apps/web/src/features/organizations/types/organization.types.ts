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

export type BillingPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type BillingStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

export interface BillingInfo {
  id: string;
  organizationId: string;
  currentPlan: BillingPlan;
  billingCycle: BillingCycle;
  status: BillingStatus;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePlanPayload {
  plan: BillingPlan;
  billingCycle: BillingCycle;
}

export interface UpdatePlanResponse {
  token?: string;
  redirectUrl?: string;
}
