import type { PageContextServer } from 'vike/types';

import { fetchCurrentUser } from '@/features/auth/api/currentUserApi';
import type { CurrentSession } from '@/features/auth/authTypes';
import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';

export type ServerAuthResult = {
  session: CurrentSession;
  accessToken: string;
  isAdmin: boolean;
} | null;

/**
 * Single server-side session resolver shared by all +guard.ts and +data.ts hooks.
 * Returns null when no valid session exists (unauthenticated or backend rejected token).
 */
export async function resolveServerAuth(
  pageContext: PageContextServer,
): Promise<ServerAuthResult> {
  const supabase = createSupabaseServerClient(
    pageContext.headers as Record<string, string> | null,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const accessToken = session.access_token;

  try {
    const currentSession = await fetchCurrentUser(accessToken);
    return {
      session: currentSession,
      accessToken,
      isAdmin: currentSession.permissions.admin === true,
    };
  } catch {
    // 401 or network failure — treat as unauthenticated
    return null;
  }
}
