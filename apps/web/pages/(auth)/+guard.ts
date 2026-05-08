import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';

export async function guard(pageContext: PageContextServer) {
  // /reset-password: Supabase recovery token fires SIGNED_IN, must not be blocked by guest gate
  // /auth/callback: handles the OAuth/email code exchange — must run regardless of session state
  const bypassed = ['/reset-password', '/auth/callback'];
  if (bypassed.includes(pageContext.urlPathname)) return;

  const supabase = createSupabaseServerClient(
    pageContext.headers as Record<string, string> | null,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    throw redirect('/');
  }
}
