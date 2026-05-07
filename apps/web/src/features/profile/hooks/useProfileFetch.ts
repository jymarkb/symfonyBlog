import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/auth/supabaseClient";
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
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setError(errorRef.current);
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetcherRef.current(sessionData.session.access_token);
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
