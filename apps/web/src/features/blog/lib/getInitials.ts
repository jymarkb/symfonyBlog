export function getInitials(displayName: string | null, handle: string): string {
  const source = displayName?.trim() || handle.replace(/^@/, '');
  return source[0]?.toUpperCase() ?? '?';
}
