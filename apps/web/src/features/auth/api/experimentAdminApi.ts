import { apiRequest } from '@/lib/api/apiClient';
import type { ExperimentVariantReport } from '@/features/auth/authTypes';

export async function fetchExperimentReport(
  experiment: string,
  accessToken: string,
): Promise<ExperimentVariantReport[]> {
  const response = await apiRequest<{ data: ExperimentVariantReport[] }>(
    `/admin/experiments?experiment=${encodeURIComponent(experiment)}`,
    { accessToken },
  );
  return response.data;
}
