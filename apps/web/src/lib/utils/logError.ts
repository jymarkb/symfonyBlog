export function logError(error: unknown): void {
  console.error(error instanceof Error ? error.message : error);
}
