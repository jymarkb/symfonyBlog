import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import {
  fetchPrivateProfile,
  fetchProfileComments,
  fetchReadingHistory,
} from '@/features/profile/api/profileApi';
import type { ProfilePageData } from '@/features/profile/profileTypes';
import { resolveServerAuth } from '@/lib/auth/serverAuth';

export async function data(pageContext: PageContextServer): Promise<ProfilePageData> {
  // data() runs before guard() in Vike — resolveServerAuth() is the safety net here.
  const auth = await resolveServerAuth(pageContext);

  if (!auth) {
    throw redirect('/signin');
  }

  // Profile is required — let it throw and surface a 500 if the backend is unreachable.
  const profile = await fetchPrivateProfile(auth.accessToken);

  // Comments and history are display-only — degrade gracefully to empty on failure.
  const [commentsResult, historyResult] = await Promise.allSettled([
    fetchProfileComments(auth.accessToken),
    fetchReadingHistory(auth.accessToken),
  ]);

  return {
    profile,
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
    readingHistory: historyResult.status === 'fulfilled' ? historyResult.value : [],
  };
}
