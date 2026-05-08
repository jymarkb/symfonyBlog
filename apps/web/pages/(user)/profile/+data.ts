import { redirect } from 'vike/abort';
import type { PageContextServer } from 'vike/types';

import {
  fetchPrivateProfile,
  fetchProfileComments,
  fetchReadingHistory,
} from '@/features/profile/api/profileApi';
import type { ProfilePageData } from '@/features/profile/profileTypes';

export async function data(pageContext: PageContextServer): Promise<ProfilePageData> {
  // onBeforeRender runs before data() and sets userAccessToken from the session cookie.
  // The guard already redirected guests, so a missing token here is an edge case.
  const accessToken = pageContext.userAccessToken;

  if (!accessToken) {
    throw redirect('/signin');
  }

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
