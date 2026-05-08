export type AccessLevel = 'public' | 'guest-only' | 'auth-required' | 'admin-required';

declare global {
  namespace Vike {
    interface Config {
      accessLevel?: AccessLevel;
    }
    interface PageContext {
      config: {
        accessLevel: AccessLevel;
      };
      initialUser?: {
        displayName: string | null;
        handle: string | null;
        isAdmin: boolean;
      } | null;
    }
  }
}

export {};
