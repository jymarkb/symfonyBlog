declare global {
  namespace Vike {
    interface PageContext {
      initialUser?: {
        displayName: string | null;
        handle: string | null;
        isAdmin: boolean;
      } | null;
    }
  }
}

export {};
