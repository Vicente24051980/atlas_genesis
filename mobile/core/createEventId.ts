export function createEventId(prefix: string): string {
  const time = Date.now().toString(36);
  const entropy = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${time}-${entropy}`.toUpperCase();
}
