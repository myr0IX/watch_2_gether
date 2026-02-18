import {
  FunctionT,
  Tool,
  ToolTypes,
} from "@mistralai/mistralai/models/components";
import { TOOLS_NAMES } from "./types";

const movieCardFunction: FunctionT = {
  name: TOOLS_NAMES.MOVIES_CARD,
  description: "Affiche une carte visuelle pour un film ou une série.",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Titre du film ou de la série",
      },
      description: {
        type: "string",
        description: "Synopsis ou description",
      },
      imdbRating: {
        type: "number",
        description: "Note IMDb sur 10",
      },
      imdbId: {
        type: "string",
        description: "Identifiant IMDb (ex: tt1234567)",
      },
    },
    required: ["title", "description", "imdbRating"],
  },
};

export const movieCardTool: Tool = {
  type: ToolTypes.Function,
  function: movieCardFunction,
};
