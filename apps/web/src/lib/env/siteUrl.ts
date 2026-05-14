export const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) ?? '';

// Hostname-only (e.g. "jymb.blog") derived from VITE_SITE_URL for use in display text.
export const siteName = siteUrl ? new URL(siteUrl).hostname : '';
