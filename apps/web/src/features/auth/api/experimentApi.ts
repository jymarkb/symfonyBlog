import { apiRequest } from '@/lib/api/apiClient';
import type { TrackExperimentPayload } from '@/features/auth/authTypes';

export async function trackExperiment(payload: TrackExperimentPayload): Promise<void> {
  try {
    await apiRequest('/experiments/track', {
      method: 'POST',
      body: payload,
    });
  } catch {
    // fire-and-forget — never block UI on tracking failure
  }
}
