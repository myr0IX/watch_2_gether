import { z } from "zod";

export const movieCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imdbRating: z.number().min(0).max(10),
  imdbId: z.string().optional(),
});

export type MovieCardData = z.infer<typeof movieCardSchema>;
