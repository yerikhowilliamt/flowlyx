import { api } from '@/lib/api-client';
import { CreateOrganizationInput, UpdateOrganizationInput } from '../schemas/organization.schema';
import {
  OrganizationResponse,
  OrganizationSummary,
  BillingInfo,
  UpdatePlanPayload,
  UpdatePlanResponse,
} from '../types/organization.types';
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const getOrganizations = async (): Promise<OrganizationSummary[]> => {
  const response = await api.get<ApiResponse<OrganizationSummary[]>>('/organizations');
  return response.data;
};

export const getOrganizationById = async (id: string): Promise<OrganizationResponse> => {
  const response = await api.get<ApiResponse<OrganizationResponse>>(`/organizations/${id}`);
  return response.data;
};

export const getOrganizationBySlug = async (slug: string): Promise<OrganizationResponse> => {
  const response = await api.get<ApiResponse<OrganizationResponse>>(`/organizations/slug/${slug}`);
  return response.data;
};

export const createOrganization = async (
  data: CreateOrganizationInput,
): Promise<OrganizationResponse> => {
  const response = await api.post<ApiResponse<OrganizationResponse>>('/organizations', data);
  return response.data;
};

export const updateOrganization = async (
  id: string,
  data: UpdateOrganizationInput,
): Promise<OrganizationResponse> => {
  const response = await api.patch<ApiResponse<OrganizationResponse>>(`/organizations/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await api.delete<void>(`/organizations/${id}`);
};

export const getBillingInfo = async (organizationId: string): Promise<BillingInfo> => {
  const response = await api.get<ApiResponse<BillingInfo>>(
    `/organizations/${organizationId}/billing`,
  );
  return response.data;
};

export const syncBillingTransaction = async (orderId: string): Promise<{ synced: boolean; status: string }> => {
  const response = await api.get<ApiResponse<{ synced: boolean; status: string }>>(
    `/billing/sync/${orderId}`,
  );
  return response.data;
};

export const updateBillingPlan = async (
  organizationId: string,
  data: UpdatePlanPayload,
): Promise<UpdatePlanResponse> => {
  const response = await api.put<ApiResponse<UpdatePlanResponse>>(
    `/organizations/${organizationId}/billing/plan`,
    data,
  );
  return response.data;
};
