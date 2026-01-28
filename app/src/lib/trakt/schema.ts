import { z } from "zod";
import { SearchMediaType, GENRE_VALUES, type Genre, SearchMediaTypeValues } from "./types";
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "./constant";

/**
 * API Request schema - What Trakt API expects
 * Built after converting tool input to API request
 */
export const traktAPIRequestSchema = z.object({
  query: z.string().min(1, "Query is required for Trakt API"),
  type: z.enum(SearchMediaTypeValues).optional(),
  years: z.string().optional(), // "2025" or "2020-2025"
  genres: z.array(z.enum(GENRE_VALUES)).max(3).optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  page: z.number().int().min(1).default(DEFAULT_PAGE),
});

export type SearchInput = z.infer<typeof traktAPIRequestSchema>;

/**
 * Output schema - single movie result
 */
export const movieResultSchema = z.object({
  title: z.string(),
  year: z.number().int().nullable(),
  ids: z.object({
    trakt: z.coerce.number(),
    slug: z.string(),
    imdb: z.string().nullable().optional(),
    tmdb: z.number().nullable().optional(),
  }),
});

/**
 * Output schema - single show result
 */
export const showResultSchema = z.object({
  title: z.string(),
  year: z.number().int().nullable(),
  ids: z.object({
    trakt: z.coerce.number(),
    slug: z.string(),
    imdb: z.string().nullable().optional(),
    tmdb: z.number().nullable().optional(),
  }),
});

/**
 * Output schema - single person result
 */
export const personResultSchema = z.object({
  name: z.string(),
  ids: z.object({
    trakt: z.coerce.number(),
    slug: z.string(),
    imdb: z.string().nullable().optional(),
    tmdb: z.number().nullable().optional(),
  }),
});

/**
 * Output schema - search result (can be movie, show, or person)
 */
export const searchResultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(SearchMediaTypeValues.MOVIE),
    score: z.number().optional(),
    movie: movieResultSchema,
  }),
  z.object({
    type: z.literal(SearchMediaTypeValues.SHOW),
    score: z.number().optional(),
    show: showResultSchema,
  }),
  z.object({
    type: z.literal(SearchMediaTypeValues.PERSON),
    score: z.number().optional(),
    person: personResultSchema,
  }),
]);

/**
 * Full search response (array of results)
 */
export const searchResponseSchema = z.array(searchResultSchema);

/**
 * Type exports
 */
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
