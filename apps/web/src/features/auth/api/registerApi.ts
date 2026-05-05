import { supabase } from '@/lib/auth/supabaseClient';
import { fetchCurrentUser } from '@/features/auth/api/currentUserApi';
import type { SocialAuthProvider } from '@/features/auth/authTypes';
import { setPendingAuthProvider } from '@/features/auth/lib/lastAuthProvider';

type RegisterInput = {
    displayName: string;
    handle: string;
    email: string;
    password: string;
}

export async function registerWithEmail(params: RegisterInput) {
    const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
                display_name: params.displayName,
                handle: params.handle,
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    const accessToken = data.session?.access_token;

    if (!accessToken) {
        return {
            needsEmailConfirmation: true,
            currentUser: null,
        };
    }

    return {
        needsEmailConfirmation: false,
        currentUser: await fetchCurrentUser(accessToken),
    };
}

export async function registerWithSocialProvider(provider: SocialAuthProvider) {
    setPendingAuthProvider(provider);

    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        throw new Error(error.message);
    }
}
