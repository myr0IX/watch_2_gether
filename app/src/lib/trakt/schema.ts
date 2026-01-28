import { z } from "zod";
import { GENRE_VALUES, SearchMediaTypeValues } from "./types";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "./constant";

export const trendingRequestSchema = z.object({
  type: z.enum(SearchMediaTypeValues),
  years: z.string().optional(),
  genres: z.array(z.enum(GENRE_VALUES)).optional(),
  limit: z.number().int().min(1).default(DEFAULT_LIMIT),
  page: z.number().int().min(1).default(DEFAULT_PAGE),
});

export type TrendingInput = z.infer<typeof trendingRequestSchema>;

const idsSchema = z.object({
  trakt: z.coerce.number(),
  slug: z.string(),
  imdb: z.string().nullable().optional(),
  tmdb: z.number().nullable().optional(),
});

export const movieSchema = z.object({
  title: z.string(),
  year: z.number().int().nullable(),
  ids: idsSchema,
});

export const showSchema = z.object({
  title: z.string(),
  year: z.number().int().nullable(),
  ids: idsSchema,
});

export const trendingMovieResultSchema = z.object({
  watchers: z.number(),
  movie: movieSchema,
});

export const trendingShowResultSchema = z.object({
  watchers: z.number(),
  show: showSchema,
});

export const trendingMoviesResponseSchema = z.array(trendingMovieResultSchema);
export const trendingShowsResponseSchema = z.array(trendingShowResultSchema);

export type Movie = z.infer<typeof movieSchema>;
export type Show = z.infer<typeof showSchema>;
export type TrendingMovieResult = z.infer<typeof trendingMovieResultSchema>;
export type TrendingShowResult = z.infer<typeof trendingShowResultSchema>;
