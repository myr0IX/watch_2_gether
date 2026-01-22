"use client";

import { MovieCardData } from "@/schemas/movie-card";
import { buildImdbUrl } from "@/utils/build-imdb-url";
import { Star, ExternalLink } from "lucide-react";


export function MovieCard({
  title,
  description,
  imdbRating,
  imdbId,
}: MovieCardData) {

  const imdbUrl = imdbId ? buildImdbUrl(imdbId) : null;
  
  const ratingColor =
    imdbRating >= 8
      ? "var(--fallout-yellow)"
      : imdbRating >= 6
        ? "var(--fallout-orange)"
        : "var(--fallout-red)";

  return (
    <div
      className="w-full rounded-sm p-4 border-2"
      style={{
        backgroundColor: "var(--fallout-cream)",
        borderColor: "var(--fallout-brass)",
        boxShadow:
          "0 4px 0px var(--fallout-brass), 0 6px 15px var(--fallout-shadow)",
      }}
    >
      {/* Header avec titre et rating */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3
          className="text-lg font-bold flex-1"
          style={{
            fontFamily: "Bebas Neue, sans-serif",
            color: "var(--fallout-charcoal)",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </h3>

        {/* Rating Badge */}
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-sm font-bold whitespace-nowrap"
          style={{
            backgroundColor: ratingColor,
            color: "var(--fallout-charcoal)",
            border: "2px solid var(--fallout-brass)",
          }}
        >
          <Star size={16} fill="currentColor" />
          <span className="text-sm">{imdbRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-sm mb-4 leading-relaxed"
        style={{ color: "var(--fallout-brown)" }}
      >
        {description}
      </p>

      {/* Footer with IMDb link */}
      {imdbUrl && (
        <a
          href={imdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-sm font-bold text-sm transition-all"
          style={{
            backgroundColor: "var(--fallout-yellow)",
            color: "var(--fallout-charcoal)",
            border: "2px solid var(--fallout-brass)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--fallout-orange)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--fallout-yellow)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Voir sur IMDb
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
