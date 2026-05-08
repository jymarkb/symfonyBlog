import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import {
  fetchPrivateProfile,
  fetchProfileComments,
  fetchReadingHistory,
} from '@/features/profile/api/profileApi';
import { createSupabaseServerClient } from '@/lib/auth/supabaseServerClient';
import type { ProfilePageData } from '@/features/profile/profileTypes';

export async function data(pageContext: PageContextServer): Promise<ProfilePageData> {
  // data() runs before onBeforeRender() in Vike, so pageContext.userAccessToken is not
  // yet available here. Read the session directly from the cookie instead.
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

  // Profile is required — let it throw and surface a 500 if the backend is unreachable.
  const profile = await fetchPrivateProfile(accessToken);

  // Comments and history are display-only — degrade gracefully to empty on failure.
  const [commentsResult, historyResult] = await Promise.allSettled([
    fetchProfileComments(accessToken),
    fetchReadingHistory(accessToken),
  ]);

  return {
    profile,
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
    readingHistory: historyResult.status === 'fulfilled' ? historyResult.value : [],
  };
}
