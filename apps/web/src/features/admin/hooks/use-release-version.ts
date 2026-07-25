import { useQuery } from '@tanstack/react-query';
import { getReleaseVersion, ReleaseVersionInfo } from '../api/release-candidate.api';

export const useReleaseVersion = () => {
  return useQuery<ReleaseVersionInfo, Error>({
    queryKey: ['release-version'],
    queryFn: getReleaseVersion,
  });
};
