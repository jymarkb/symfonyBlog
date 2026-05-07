import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AuthChangeEvent,
  Session as SupabaseSession,
} from "@supabase/supabase-js";

import { fetchCurrentUser } from "@/features/auth/api/currentUserApi";
import type { CurrentSession } from "@/features/auth/authTypes";
import type {
  CurrentSessionContextValue,
  CurrentSessionStatus,
} from "@/features/auth/session/currentSessionTypes";
import { ApiError } from "@/lib/api/apiClient";
import { supabase } from "@/lib/auth/supabaseClient";

export const CurrentSessionContext =
  createContext<CurrentSessionContextValue | null>(null);

type CurrentSessionProviderProps = {
  children: ReactNode;
};

export function CurrentSessionProvider({
  children,
}: CurrentSessionProviderProps) {
  const [status, setStatus] = useState<CurrentSessionStatus>("loading");
  const [currentSession, setCurrentSession] =
    useState<CurrentSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const initialFiredRef = useRef(false);

  const resolveLaravelSession = useCallback(
    async (supabaseSession: SupabaseSession | null) => {
      const accessToken = supabaseSession?.access_token;

      if (!accessToken) {
        setCurrentSession(null);
        setStatus("guest");
        setError(null);
        return null;
      }

      try {
        const nextSession = await fetchCurrentUser(accessToken);

        if (!mountedRef.current) return nextSession;

        setCurrentSession(nextSession);
        setStatus("authenticated");
        setError(null);

        return nextSession;
      } catch (caught) {
        if (!mountedRef.current) return null;

        if (caught instanceof ApiError && caught.status === 401) {
          await supabase.auth.signOut();
          setCurrentSession(null);
          setStatus("guest");
          setError(null);
          return null;
        }

        setCurrentSession(null);
        setStatus("error");
        setError("Unable to load your session. Please try again.");
        return null;
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setCurrentSession(null);
      setStatus("guest");
      setError(null);
      return null;
    }

    return resolveLaravelSession(data.session);
  }, [resolveLaravelSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentSession(null);
    setStatus("guest");
    setError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: SupabaseSession | null) => {
        if (event === "INITIAL_SESSION") {
          initialFiredRef.current = true;
          await resolveLaravelSession(session);
          return;
        }

        if (event === "SIGNED_OUT") {
          setCurrentSession(null);
          setStatus("guest");
          setError(null);
          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          await resolveLaravelSession(session);
        }
      },
    );

    void Promise.resolve().then(() => {
      if (!initialFiredRef.current) void refreshSession();
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [refreshSession, resolveLaravelSession]);

  const value = useMemo<CurrentSessionContextValue>(() => {
    const permissions = currentSession?.permissions ?? null;

    return {
      status,
      currentSession,
      user: currentSession?.user ?? null,
      permissions,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
      isAdmin: permissions?.admin === true,
      error,
      refreshSession,
      signOut,
    };
  }, [currentSession, error, refreshSession, signOut, status]);

  return (
    <CurrentSessionContext.Provider value={value}>
      {children}
    </CurrentSessionContext.Provider>
  );
}
