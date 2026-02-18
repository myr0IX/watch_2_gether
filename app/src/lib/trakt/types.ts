/**
 * Trakt Search API - Minimal Types for Movie/Show Search
 * Only essential types for basic chatbot search functionality
 */

/**
 * Media types that can be searched
 */
export const SearchMediaTypeValues = {
  MOVIE: "movie",
  SHOW: "show",
  PERSON: "person",
} as const;

export type SearchMediaType = typeof SearchMediaTypeValues[keyof typeof SearchMediaTypeValues];

/**
 * Most common genres for filtering
 */
export const GENRE_VALUES = [
  "action",
  "comedy",
  "drama",
  "horror",
  "romance",
  "thriller",
  "animation",
  "documentary",
  "fantasy",
  "science-fiction",
] as const;

export type Genre = typeof GENRE_VALUES[number];

/**
 * Trakt IDs object
 */
export interface TraktIds {
  trakt: number;
  slug: string;
  imdb?: string;
  tmdb?: number;
}

/**
 * Movie object
 */
export interface Movie {
  title: string;
  year: number;
  ids: TraktIds;
}

/**
 * Show object
 */
export interface Show {
  title: string;
  year: number;
  ids: TraktIds;
}

/**
 * Person object
 */
export interface Person {
  name: string;
  ids: TraktIds;
}

/**
 * Search result item
 */
export interface SearchResult {
  type: SearchMediaType;
  score?: number;
  movie?: Movie;
  show?: Show;
  person?: Person;
}

// /**
//  * Basic search filters for chatbot
//  */
// export interface SearchFilters {
//   query: string;
//   type?: SearchMediaType; // "movie", "show", or "person"
//   years?: string; // "2025" or "2020-2025"
//   genres?: Genre | Genre[]; // Single genre or array
//   limit?: number; // Results per page (default: 10)
//   page?: number; // Page number (default: 1)
// }
