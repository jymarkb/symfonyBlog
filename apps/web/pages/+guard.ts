import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import { resolveServerAuth } from '@/lib/auth/serverAuth';

// Supabase fires SIGNED_IN during the OAuth/recovery token exchange on these paths,
// so they must bypass the guest-only gate and run regardless of session state.
const GUEST_GATE_BYPASS = ['/reset-password', '/auth/callback'];

export async function guard(pageContext: PageContextServer) {
  const { accessLevel } = pageContext.config;

  if (accessLevel === 'public') return;

  if (accessLevel === 'guest-only' && GUEST_GATE_BYPASS.includes(pageContext.urlPathname)) {
    return;
  }

  const auth = await resolveServerAuth(pageContext);

  switch (accessLevel) {
    case 'guest-only':
      if (auth !== null) throw redirect('/');
      break;

    case 'auth-required':
      if (auth === null) throw redirect('/signin');
      break;

    case 'admin-required':
      if (auth === null) throw redirect('/signin');
      if (!auth.isAdmin) throw redirect('/');
      break;
  }
}
