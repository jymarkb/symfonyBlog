import type {
  CurrentSession,
  CurrentSessionResponse,
} from "@/features/auth/authTypes";
import { apiRequest } from "@/lib/api/apiClient";

export async function fetchCurrentUser(
  accessToken: string,
): Promise<CurrentSession> {
  const response = await apiRequest<CurrentSessionResponse>("/session", {
    accessToken,
  });

  return response.data;
}
