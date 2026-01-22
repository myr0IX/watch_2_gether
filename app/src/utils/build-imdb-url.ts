/**
 * Build the IMDb URL from the IMDb ID
 * @param imdbId - The IMDb ID
 * @returns The IMDb URL
 */
export function buildImdbUrl(imdbId: string | null): string | null {
    if (!imdbId) return null;
    return `https://www.imdb.com/title/${imdbId}/`;
  }
  