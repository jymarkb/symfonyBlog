import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    {
        auth: {
            detectSessionInUrl: false,
            flowType: 'pkce',
        },
    },
);
