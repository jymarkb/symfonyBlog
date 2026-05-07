import { apiRequest } from "@/lib/api/apiClient";
import type { DeleteAccountResponse, ProfileCommentsResponse, ProfileReadingHistoryResponse, UpdateNotificationsPayload } from '@/features/profile/profileTypes';

import type {
    PrivateProfile,
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

export async function deleteAccount(accessToken: string): Promise<DeleteAccountResponse> {
  return apiRequest<DeleteAccountResponse>('/profile', {
    accessToken,
    method: 'DELETE',
  });
}

export async function updateNotifications(
  accessToken: string,
  payload: UpdateNotificationsPayload,
): Promise<PrivateProfile> {
  const response = await apiRequest<PrivateProfileResponse>('/profile/notifications', {
    accessToken,
    method: 'PATCH',
    body: payload,
  });
  return response.data;
}