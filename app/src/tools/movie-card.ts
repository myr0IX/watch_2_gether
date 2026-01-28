import {
  FunctionT,
  Tool,
  ToolTypes,
} from "@mistralai/mistralai/models/components";
import { TOOLS_NAMES } from "./types";

const PROMPT_DESCRIPTION = `
IMPORTANT: You MUST follow this exact workflow:

1. FIRST: Write a friendly text message explaining what movies you're recommending (e.g., "Voici 3 excellents films d'action que je recommande:" or "Basé sur votre demande, voici ma sélection de films:")

2. THEN: Call this tool ONCE PER MOVIE - never skip any movie, always provide the exact quantity requested

3. OPTIONALLY: Add any additional context or explanation after the movies

Critical Rules:
- This tool is the ONLY way to display movie information
- NEVER describe movies in plain text after calling the tool
- If user asks for N movies, call this tool N times - no exceptions
- Each movie card is a separate tool call
- Always include a text explanation BEFORE the first movie card

Example flow for "give me 3 action movies":
"Voici 3 excellents films d'action pour vous:"
[call tool for Movie 1]
[call tool for Movie 2]
[call tool for Movie 3]
"Ces films offrent une excellente action et des histoires captivantes!"
`;

const movieCardFunction: FunctionT = {
  name: TOOLS_NAMES.MOVIES_CARD,
  description: PROMPT_DESCRIPTION,
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Titre du film",
      },
      description: {
        type: "string",
        description: "Résumé court",
      },
      imdbRating: {
        type: "number",
        description: "Note IMDb sur 10",
      },
      imdbId: {
        type: "string",
        description: "ID IMDb",
      },
    },
    required: ["title", "description", "imdbRating"],
  },
};

export const movieCardTool: Tool = {
  type: ToolTypes.Function,
  function: movieCardFunction,
};
