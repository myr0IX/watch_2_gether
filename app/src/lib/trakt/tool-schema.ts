import { z } from "zod";
import { SearchMediaTypeValues, GENRE_VALUES } from "./types";

/**
 * AI-friendly search input schema for the Mistral tool
 *
 * Simplified for MVP: only essential parameters that make sense for an AI to use.
 * Pagination and limits are hardcoded (always returns 5 results).
 */
export const traktSearchToolSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .describe(
      "The movie, show, or person name to search for. Examples: 'Inception', 'Breaking Bad', 'Leonardo DiCaprio'"
    ),

  type: z
    .enum(SearchMediaTypeValues)
    .describe(
      "Type of content: 'movie' for films, 'show' for TV series, 'person' for actors/directors. If not specified, defaults to 'movie'."
    )
    .optional(),

  year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .describe(
      "Filter results by release year. Example: 2023"
    )
    .optional(),

  genres: z
    .array(z.enum(GENRE_VALUES))
    .max(3)
    .describe(
      "Filter by genres (max 3). Available genres: action, comedy, drama, horror, romance, thriller, animation, documentary, fantasy, science-fiction. Example: ['action', 'thriller']"
    )
    .optional(),
});

export type TraktSearchToolInput = z.infer<typeof traktSearchToolSchema>;
