import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';

export async function guard(pageContext: PageContextServer) {
  const supabase = createSupabaseServerClient(
    pageContext.headers as Record<string, string> | null,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect('/signin');
  }
}
