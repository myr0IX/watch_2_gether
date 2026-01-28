import { searchQuery } from "./api";
import { DEFAULT_LIMIT, DEFAULT_PAGE, TRAKT_SEARCH_URL } from "./constant";
import { traktAPIRequestSchema, searchResponseSchema } from "./schema";
import type { SearchInput, SearchResponse } from "./schema";
import { traktSearchToolInputSchema } from "./tool-schema";
import type { TraktSearchToolInput } from "./tool-schema";
import { SearchMediaTypeValues } from "./types";

/**
 * Build query string from AI parameters
 *
 * If title is provided, use it directly.
 * Otherwise, construct from genres/type parameters.
 * Example: title="Avatar" → "Avatar"
 * Example: genres=["action"], type="movie" → "action movie"
 */
function buildQueryFromParams(toolInput: TraktSearchToolInput): string {
  // If AI provided a specific title, use it
  if (toolInput.title) {
    return toolInput.title;
  }

  const parts: string[] = [];

  // Add genres as primary search terms
  if (toolInput.genres && toolInput.genres.length > 0) {
    parts.push(...toolInput.genres);
  }

  // Add type as context
  if (toolInput.type && toolInput.type !== SearchMediaTypeValues.MOVIE) {
    parts.push(toolInput.type);
  }

  // If no genres, use type or default
  if (parts.length === 0) {
    return toolInput.type || SearchMediaTypeValues.MOVIE;
  }

  return parts.join(" ");
}

/**
 * Convert tool input (from AI) to internal service format
 *
 * This adapter translates the simplified AI tool input into the internal SearchInput format.
 * - Builds query from genres/type/year parameters
 * - Converts year to years string format
 * - Adds hardcoded limit (5) and page (1) for MVP
 */
function mapToolInputToServiceInput(
  toolInput: TraktSearchToolInput
): SearchInput {
  const query = buildQueryFromParams(toolInput);

  console.debug("Mapping tool input to service input", { ...toolInput, generatedQuery: query });
  return {
    query,
    type: toolInput.type || SearchMediaTypeValues.MOVIE,
    // Convert year number to string format expected by API
    years: toolInput.year?.toString(),
    // Take genres if provided
    genres: toolInput.genres,
    // Hardcoded for MVP: always 5 results, first page
    limit: DEFAULT_LIMIT,
    page: DEFAULT_PAGE,
  };
}

/**
 * Build query string from search filters
 */
function buildQueryString(input: SearchInput): string {
  const params = new URLSearchParams();

  if (input.query) {
    params.append("query", input.query);
  }

  if (input.type) {
    params.append("type", input.type);
  }

  if (input.years) {
    params.append("years", input.years);
  }

  if (input.genres) {
    const genreString = Array.isArray(input.genres)
      ? input.genres.join(",")
      : input.genres;
    params.append("genres", genreString);
  }

  params.append("limit", input.limit.toString());
  params.append("page", input.page.toString());

  return params.toString();
}

/**
 * Main search function used by internal service
 */
export async function searchService(input: SearchInput): Promise<SearchResponse> {
    const validatedInput = traktAPIRequestSchema.parse(input);

    const queryString = buildQueryString(validatedInput);
    const response = await searchQuery(queryString);

    if (!response.ok) {
        throw new Error(
          `Trakt API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      console.log("Received data from Trakt API:", data);

      const validatedResponse = searchResponseSchema.parse(data);

      return validatedResponse;
}

/**
 * Search function exposed to AI tools
 *
 * This is the entry point for Mistral AI to call.
 * It takes simplified input, adapts it, and calls the internal service.
 */
export async function searchTraktTool(
  input: TraktSearchToolInput
): Promise<SearchResponse> {
  const serviceInput = mapToolInputToServiceInput(input);
  return searchService(serviceInput);
}

/**
 * Execute search tool from raw tool arguments
 *
 * This function is called by the backend when the AI requests the trakt_search tool.
 * It validates and executes the search, returning formatted results for the AI.
 */
export async function executeSearchTool(
  args: Record<string, unknown>
): Promise<SearchResponse> {
  try {
    console.log("Executing search tool with arguments:", args);

    // Validate and parse the arguments using the tool schema
    const input = traktSearchToolInputSchema.parse(args);

    // Execute the tool
    const results = await searchTraktTool(input);
    console.log("Search results:", results);
    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur lors de la recherche Trakt:", errorMessage);
    throw new Error(`Erreur lors de la recherche Trakt: ${errorMessage}`);
  }
}