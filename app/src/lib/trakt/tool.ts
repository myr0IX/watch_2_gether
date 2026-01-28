import {
  FunctionT,
  Tool,
  ToolTypes,
} from "@mistralai/mistralai/models/components";
import { SearchMediaTypeValues, GENRE_VALUES } from "./types";
import { TOOLS_NAMES } from "@/tools/types";

const TOOL_DESCRIPTION = `Search for movies, TV shows, or people on Trakt. Use this tool when the user asks to find, search for, or look up entertainment content. Examples:
- "Find movies with action and thriller genres"
- "Search for Breaking Bad"
- "Look up Leonardo DiCaprio"
- "Find horror movies from 2023"`;

/**
 * JSON Schema for the trakt_search tool
 * This defines what parameters the AI can pass and their types/descriptions
 */
const searchToolSchema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      optional: true,
      description:
        "The movie, show, or person name to search for. Examples: 'Inception', 'Breaking Bad', 'Leonardo DiCaprio'",
    },
    type: {
      type: "string",
      optional: true,
      enum: Object.values(SearchMediaTypeValues),
      description:
        "Type of content: 'movie' for films, 'show' for TV series, 'person' for actors/directors. If not specified, defaults to 'movie'.",
    },
    year: {
      type: "number",
      optional: true,
      minimum: 1900,
      maximum: 2100,
      description: "Filter results by release year. Example: 2023",
    },
    genres: {
      type: "array",
      optional: true,
      items: {
        type: "string",
        enum: GENRE_VALUES,
      },
      maxItems: 3,
      description:
        "Filter by genres (max 3). Available genres: action, comedy, drama, horror, romance, thriller, animation, documentary, fantasy, science-fiction. Example: ['action', 'thriller']",
    },
  },
};

const searchFunction: FunctionT = {
  name: TOOLS_NAMES.MOVIES_SEARCH,
  description: TOOL_DESCRIPTION,
  parameters: searchToolSchema,
};

export const searchTool: Tool = {
  type: ToolTypes.Function,
  function: searchFunction,
};
