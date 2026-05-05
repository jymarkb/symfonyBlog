type ApiRequestOptions = {
    accessToken?: string;
    body?: unknown;
    method?: "GET" | "POST" | "PATCH" | "DELETE";
};

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const headers: HeadersInit = {
        Accept: "application/json",
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (options.accessToken) {
        headers.Authorization = `Bearer ${options.accessToken}`;
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
        throw new ApiError("Unable to complete API request.", response.status);
    }

    return response.json() as Promise<T>;
}
