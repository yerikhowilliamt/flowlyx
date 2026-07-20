import { api } from '@/lib/api-client';
import { CreateOrganizationInput, UpdateOrganizationInput } from '../schemas/organization.schema';
import { OrganizationResponse, OrganizationSummary } from '../types/organization.types';
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
