import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';
import {
  fetchPrivateProfile,
  fetchProfileComments,
  fetchReadingHistory,
} from '@/features/profile/api/profileApi';
import type { ProfilePageData } from '@/features/profile/profileTypes';

export async function data(pageContext: PageContextServer): Promise<ProfilePageData> {
  const supabase = createSupabaseServerClient(
    pageContext.headers as Record<string, string> | null,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw redirect('/signin');
  }

  const accessToken = session.access_token;

  const [profile, comments, readingHistory] = await Promise.all([
    fetchPrivateProfile(accessToken),
    fetchProfileComments(accessToken),
    fetchReadingHistory(accessToken),
  ]);

  return { profile, comments, readingHistory };
}
