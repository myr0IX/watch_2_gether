"use client";

import { MovieCard } from "./movie-card";
import type { MovieCardData } from "@/schemas/movie-card";

interface MovieCardListProps {
  cards: MovieCardData[];
}

export function MovieCardList({ cards }: MovieCardListProps) {
  return (
    <>
      {cards.map((card, index) =>
      (
        <div
          key={index}
          className="w-full animate-in fade-in slide-in-from-bottom-4"
        >
          <MovieCard
            title={card.title}
            description={card.description}
            imdbRating={card.imdbRating}
            imdbUrl={card.imdbUrl}
          />
        </div>
      ))}
    </>
  );
}
