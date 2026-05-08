import type { PageContextServer } from 'vike/types';

import { resolveServerAuth } from '@/lib/auth/serverAuth';

export async function onBeforeRender(pageContext: PageContextServer) {
  // Auth-shell pages have no site Header — skip the session call.
  if (pageContext.config.accessLevel === 'guest-only') {
    return { pageContext: { initialUser: null } };
  }

  const auth = await resolveServerAuth(pageContext);

  if (!auth) {
    return { pageContext: { initialUser: null } };
  }

  return {
    pageContext: {
      initialUser: {
        displayName: auth.session.user.display_name,
        handle: auth.session.user.handle,
        isAdmin: auth.isAdmin,
      },
    },
  };
}
