export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
