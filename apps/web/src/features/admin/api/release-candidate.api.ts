import { api } from '@/lib/api-client';

export interface ReleaseVersionInfo {
  version: string;
  status: string;
  timestamp: string;
}

export const getReleaseVersion = async (): Promise<ReleaseVersionInfo> => {
  return api.get<ReleaseVersionInfo>('/release-candidate/version');
};
