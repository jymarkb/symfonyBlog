import { apiRequest } from "@/lib/api/apiClient";
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
