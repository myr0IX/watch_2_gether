import { z } from "zod";

export const movieCardSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Résumé court requis"),
  imdbRating: z.number().min(0).max(10, "Note IMDb doit être entre 0 et 10"),
  imdbId: z.string().optional(),
});

export type MovieCardData = z.infer<typeof movieCardSchema>;

export const movieCardToolSchema = z.object({
  type: z.literal("movie_card"),
  data: movieCardSchema,
});

export type MovieCardTool = z.infer<typeof movieCardToolSchema>;
