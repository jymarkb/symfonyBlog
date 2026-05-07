import { apiRequest } from "@/lib/api/apiClient";
import type { ProfileCommentsResponse, ProfileReadingHistoryResponse } from '@/features/profile/profileTypes';

import type {
    PrivateProfileResponse,
    ProfileFormSubmitInput,
} from "@/features/profile/profileTypes";

export async function fetchPrivateProfile(accessToken: string) {
    const response = await apiRequest<PrivateProfileResponse>("/profile", {
        accessToken,
    });

    return response.data;
}

export async function updatePrivateProfile(
    accessToken: string,
    input: ProfileFormSubmitInput,
) {
    const response = await apiRequest<PrivateProfileResponse>("/profile", {
        accessToken,
        method: "PATCH",
        body: input,
    });

    return response.data;
}

export async function fetchProfileComments(accessToken: string) {
    const response = await apiRequest<ProfileCommentsResponse>('/profile/comments', {
        accessToken,
    });
    return response.data;
}

export async function fetchReadingHistory(accessToken: string) {
  const response = await apiRequest<ProfileReadingHistoryResponse>('/profile/reading-history', {
    accessToken,
  });
  return response.data;
}