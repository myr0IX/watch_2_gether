import { z } from "zod";
import { SearchMediaTypeValues, GENRE_VALUES } from "./types";

/**
 * Tool Input Schema - What the AI provides when calling the Trakt search tool
 *
 * The AI provides either:
 * 1. A title/name (movie, show, or person name)
 * 2. Or structured filters (type, genres, year)
 *
 * Pagination is hardcoded server-side (always returns 5 results).
 */
export const traktSearchToolInputSchema = z.object({
  title: z
    .string()
    .optional()
    .describe(
      "The exact name of a movie, TV show, or person to search for. Examples: 'Inception', 'Breaking Bad', 'Leonardo DiCaprio'"
    ),

  type: z
    .enum(SearchMediaTypeValues)
    .optional()
    .describe(
      "Type of content: 'movie' for films, 'show' for TV series, 'person' for actors/directors. If not specified, defaults to 'movie'."
    ),

  genres: z
    .array(z.enum(GENRE_VALUES))
    .max(3)
    .optional()
    .describe(
      "Filter by genres (max 3). Available genres: action, comedy, drama, horror, romance, thriller, animation, documentary, fantasy, science-fiction. Example: ['action', 'thriller']"
    ),

  year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional()
    .describe(
      "Filter results by release year. Example: 2023"
    ),
});

export type TraktSearchToolInput = z.infer<typeof traktSearchToolInputSchema>;
