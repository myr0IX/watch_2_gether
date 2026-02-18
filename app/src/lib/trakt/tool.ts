import {
  FunctionT,
  Tool,
  ToolTypes,
} from "@mistralai/mistralai/models/components";
import { SearchMediaTypeValues, GENRE_VALUES } from "./types";
import { TOOLS_NAMES } from "@/lib/tools/types";

const searchToolSchema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      optional: true,
      description: "Nom du film, série ou personne à rechercher",
    },
    type: {
      type: "string",
      optional: true,
      enum: Object.values(SearchMediaTypeValues),
      description: "Type de contenu: 'movie', 'show' ou 'person'",
    },
    year: {
      type: "number",
      optional: true,
      minimum: 1900,
      maximum: 2100,
      description: "Filtrer par année de sortie",
    },
    genres: {
      type: "array",
      optional: true,
      items: {
        type: "string",
        enum: GENRE_VALUES,
      },
      maxItems: 3,
      description: "Filtrer par genres (max 3)",
    },
  },
};

const searchFunction: FunctionT = {
  name: TOOLS_NAMES.MOVIES_SEARCH,
  description: "Recherche des films ou séries tendance sur Trakt.",
  parameters: searchToolSchema,
};

export const searchTool: Tool = {
  type: ToolTypes.Function,
  function: searchFunction,
};
