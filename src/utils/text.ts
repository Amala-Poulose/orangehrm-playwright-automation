/** Escape a string so it can be used safely inside a RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Exact, whitespace-tolerant matcher (OrangeHRM labels often carry padding). */
export function exactText(value: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`);
}
