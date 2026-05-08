import type { PageContextServer } from 'vike/types';

import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';
import { fetchCurrentUser } from '@/features/auth/api/currentUserApi';

export async function onBeforeRender(pageContext: PageContextServer) {
  const supabase = createSupabaseServerClient(
    pageContext.headers as Record<string, string> | null,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { pageContext: { initialUser: null } };
  }

  try {
    const currentSession = await fetchCurrentUser(session.access_token);

    return {
      pageContext: {
        initialUser: {
          displayName: currentSession.user.display_name,
          handle: currentSession.user.handle,
          isAdmin: currentSession.permissions.admin,
        },
      },
    };
  } catch {
    return { pageContext: { initialUser: null } };
  }
}
