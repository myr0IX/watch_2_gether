"use client";

import { AnimatedTitle } from "./animated-title";
import { RetroButton } from "./retro-button";
import { HowItWorks } from "./how-it-works";
import { Features } from "./features";
import { Footer } from "./footer";

interface HeroSectionProps {
  onStartChat: () => void;
}

export function HeroSection({ onStartChat }: HeroSectionProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--fallout-beige)' }}
    >
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <div className="max-w-4xl w-full flex flex-col items-center gap-8">
          <AnimatedTitle />

          <RetroButton onClick={onStartChat}>
            Obtenir des recommandations
          </RetroButton>
        </div>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Features */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
}
