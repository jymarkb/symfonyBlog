import type { PageContextServer } from 'vike/types';

import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';
import { fetchCurrentUser } from '@/features/auth/api/currentUserApi';

// Auth-shell pages have no site Header — skip the session call on these routes.
const AUTH_ROUTES = ['/signin', '/signup', '/forgot-password', '/reset-password', '/auth/'];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r),
  );
}

export async function onBeforeRender(pageContext: PageContextServer) {
  if (isAuthRoute(pageContext.urlPathname)) {
    return { pageContext: { initialUser: null } };
  }

  const supabase = createSupabaseServerClient(
    pageContext.headers as Record<string, string> | null,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { pageContext: { initialUser: null } };
  }

  const accessToken = session.access_token;

  try {
    const currentSession = await fetchCurrentUser(accessToken);

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
