import { fetchMoviesTrending, fetchShowsTrending } from "./api";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "./constant";
import {
  trendingRequestSchema,
  trendingMoviesResponseSchema,
  trendingShowsResponseSchema,
  type TrendingInput,
  type TrendingMovieResult,
  type TrendingShowResult,
} from "./schema";
import { traktSearchToolInputSchema, type TraktSearchToolInput } from "./tool-schema";
import { SearchMediaTypeValues } from "./types";

function buildQueryString(input: TrendingInput): string {
  const params = new URLSearchParams();

  if (input.years) {
    params.append("years", input.years);
  }

  if (input.genres && input.genres.length > 0) {
    params.append("genres", input.genres.join(","));
  }

  params.append("limit", input.limit.toString());
  params.append("page", input.page.toString());
  params.append("extended", "full");

  return params.toString();
}

export type TrendingResult = {
  type: "movie" | "show";
  watchers: number;
  item: { title: string; year: number | null; ids: { trakt: number; slug: string; imdb?: string | null; tmdb?: number | null } };
};

async function fetchTrending(input: TrendingInput): Promise<TrendingResult[]> {
  const validatedInput = trendingRequestSchema.parse(input);
  const queryString = buildQueryString(validatedInput);

  console.debug("Fetching trending with params:", queryString);

  if (input.type === SearchMediaTypeValues.MOVIE) {
    const response = await fetchMoviesTrending(queryString);
    if (!response.ok) {
      throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.debug("Received movies from Trakt API:", data);
    const validated = trendingMoviesResponseSchema.parse(data);
    return validated.map((r: TrendingMovieResult) => ({
      type: "movie" as const,
      watchers: r.watchers,
      item: r.movie,
    }));
  } else {
    const response = await fetchShowsTrending(queryString);
    if (!response.ok) {
      throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.debug("Received shows from Trakt API:", data);
    const validated = trendingShowsResponseSchema.parse(data);
    return validated.map((r: TrendingShowResult) => ({
      type: "show" as const,
      watchers: r.watchers,
      item: r.show,
    }));
  }
}

export async function executeSearchTool(
  args: Record<string, unknown>
): Promise<TrendingResult[]> {
  console.debug("Executing search tool with arguments:", args);

  const input = traktSearchToolInputSchema.parse(args);

  const trendingInput: TrendingInput = {
    type: input.type || SearchMediaTypeValues.MOVIE,
    years: input.year?.toString(),
    genres: input.genres,
    limit: DEFAULT_LIMIT,
    page: DEFAULT_PAGE,
  };

  const results = await fetchTrending(trendingInput);
  console.debug("Trending results:", results);
  return results;
}