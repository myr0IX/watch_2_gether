export function buildImdbUrl(imdbId: string | null): string | null {
  if (!imdbId) return null;
  return `https://www.imdb.com/title/${imdbId}/`;
}
