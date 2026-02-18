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
import { traktSearchToolInputSchema } from "./tool-schema";
import { SearchMediaTypeValues } from "./types";
import { logger } from "@/lib/logger";
import type { MovieCardData } from "@/schemas/movie-card";

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
  item: {
    title: string;
    year: number | null;
    ids: { trakt: number; slug: string; imdb?: string | null; tmdb?: number | null };
    overview?: string | null;
    rating?: number | null;
  };
};

async function fetchTrending(input: TrendingInput): Promise<TrendingResult[]> {
  try {
    const validatedInput = trendingRequestSchema.parse(input);
    const queryString = buildQueryString(validatedInput);

    logger.debug("Fetching trending content", {
      type: input.type,
      queryString,
      years: input.years,
      genres: input.genres
    });

    if (input.type === SearchMediaTypeValues.MOVIE) {
      const response = await fetchMoviesTrending(queryString);
      if (!response.ok) {
        logger.error("Trakt API returned error for movies", {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      logger.debug("Received movies from Trakt API", { count: data.length });
      const validated = trendingMoviesResponseSchema.parse(data);
    return validated.map((r: TrendingMovieResult) => ({
      type: "movie" as const,
      watchers: r.watchers,
      item: r.movie,
    }));
    } else {
      const response = await fetchShowsTrending(queryString);
      if (!response.ok) {
        logger.error("Trakt API returned error for shows", {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      logger.debug("Received shows from Trakt API", { count: data.length });
      const validated = trendingShowsResponseSchema.parse(data);
      return validated.map((r: TrendingShowResult) => ({
        type: "show" as const,
        watchers: r.watchers,
        item: r.show,
      }));
    }
  } catch (error) {
    logger.error("Error fetching trending content", {
      type: input.type,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

function trendingResultToMovieCard(result: TrendingResult): MovieCardData {
  return {
    title: result.item.title,
    description: result.item.overview || "Aucune description disponible",
    imdbRating: result.item.rating ? Math.round(result.item.rating * 10) / 10 : 0,
    imdbId: result.item.ids.imdb || undefined,
  };
}

export async function executeSearchTool(
  args: Record<string, unknown>
): Promise<MovieCardData[]> {
  try {
    logger.debug("Executing search tool", { args });

    const input = traktSearchToolInputSchema.parse(args);

    const trendingInput: TrendingInput = {
      type: input.type || SearchMediaTypeValues.MOVIE,
      years: input.year?.toString(),
      genres: input.genres,
      limit: DEFAULT_LIMIT,
      page: DEFAULT_PAGE,
    };

    const results = await fetchTrending(trendingInput);
    const cards = results.map(trendingResultToMovieCard);

    logger.debug("Search tool completed", {
      resultsCount: cards.length,
      type: trendingInput.type
    });
    return cards;
  } catch (error) {
    logger.error("Search tool execution failed", {
      args,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}