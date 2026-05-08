declare global {
  namespace Vike {
    interface PageContext {
      initialUser?: {
        displayName: string | null;
        handle: string | null;
        isAdmin: boolean;
      } | null;
      // Server-side only — not in passToClient. Used by +data.ts to avoid a second session read.
      userAccessToken?: string | null;
    }
  }
}

export {};
