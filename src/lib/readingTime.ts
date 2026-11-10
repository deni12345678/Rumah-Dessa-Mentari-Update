/**
 * Calculates estimated reading time based on standard reading speed (200 words per minute).
 * Cleans markdown formatting and whitespace for accurate word counting.
 * Always returns at least 1 minute.
 */
export function calculateReadingTime(content: string, summary: string = '', wpm: number = 200): number {
  const combined = `${summary || ''} ${content || ''}`;
  // Strip markdown markers, headings, links
  const cleaned = combined
    .replace(/#+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>]/g, '')
    .trim();

  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / wpm));
}
