import { createServerClient, parseCookieHeader } from '@supabase/ssr';

export function createSupabaseServerClient(headers: Record<string, string> | null | undefined) {
  const cookieHeader = headers?.['cookie'] ?? '';
  const cookies = parseCookieHeader(cookieHeader);

  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        getAll() {
          return cookies
            .filter((c): c is { name: string; value: string } => c.value !== undefined);
        },
        setAll() {
          // read-only in guard context — token refresh happens on the browser client
        },
      },
    },
  );
}
