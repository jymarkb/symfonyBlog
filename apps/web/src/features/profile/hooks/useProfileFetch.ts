import { useCallback, useEffect, useRef, useState } from "react";

import { getAccessToken } from "@/lib/auth/getAccessToken";
import { logError } from "@/lib/utils/logError";

export function useProfileFetch<T>(
  fetcher: (token: string) => Promise<T[]>,
  errorMessage: string,
  initialData?: T[],
) {
  const [data, setData] = useState<T[]>(initialData ?? []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const errorRef = useRef(errorMessage);
  const mountedRef = useRef(true);
  // Captured at mount — immune to referential instability of the initialData array.
  const skipFetchRef = useRef(initialData !== undefined);

  const load = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const result = await fetcherRef.current(accessToken);
      if (mountedRef.current) setData(result);
    } catch (err) {
      logError(err);
      if (mountedRef.current) setError(errorRef.current);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipFetchRef.current) return;
    mountedRef.current = true;
    void load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { data, isLoading, error };
}
