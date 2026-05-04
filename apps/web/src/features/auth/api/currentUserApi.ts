export async function fetchCurrentUser(accessToken: string) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Unable to load current user.');
    }

    return response.json();
}
