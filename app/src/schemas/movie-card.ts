import { z } from "zod";

export const MovieCardDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  imdbRating: z.number().min(0).max(10),
  imdbUrl: z.string().url().optional(),
});

export type MovieCardData = z.infer<typeof MovieCardDataSchema>;

export const MovieCardToolSchema = z.object({
  type: z.literal("movie_card"),
  data: MovieCardDataSchema,
});

export type MovieCardTool = z.infer<typeof MovieCardToolSchema>;
