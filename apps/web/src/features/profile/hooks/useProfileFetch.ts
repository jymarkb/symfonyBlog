import { useCallback, useEffect, useRef, useState } from "react";

import { getAccessToken } from "@/lib/auth/getAccessToken";
import { logError } from "@/lib/utils/logError";

export function useProfileFetch<T>(
  fetcher: (token: string) => Promise<T[]>,
  errorMessage: string,
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const errorRef = useRef(errorMessage);

  const load = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const result = await fetcherRef.current(accessToken);
      setData(result);
    } catch (err) {
      logError(err);
      setError(errorRef.current);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error };
}
