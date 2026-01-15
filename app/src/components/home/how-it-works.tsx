"use client";

import { MessageSquare, Sparkles, Film } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: MessageSquare,
    title: "Discute avec l'IA",
    description: "Décris ce que tu aimes, ton mood du moment, tes préférences"
  },
  {
    icon: Sparkles,
    title: "Reçois des recommandations",
    description: "L'IA Mistral analyse et trouve les meilleurs choix pour toi"
  },
  {
    icon: Film,
    title: "Découvre ton prochain coup de cœur",
    description: "Films, séries, plateformes - tout est personnalisé"
  }
];

export function HowItWorks() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4">
      <motion.h2
        className="text-4xl font-bold text-center mb-12"
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          color: 'var(--fallout-charcoal)',
          letterSpacing: '0.1em',
          textShadow: '1px 1px 0px var(--fallout-yellow)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        Comment ça marche ?
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-sm"
              style={{
                backgroundColor: 'var(--fallout-cream)',
                border: '3px solid var(--fallout-border)',
                boxShadow: '0 4px 0px var(--fallout-border), 0 6px 15px var(--fallout-shadow)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + (i * 0.2) }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative"
                style={{
                  backgroundColor: 'var(--fallout-orange)',
                  border: '2px solid var(--fallout-brass)'
                }}
              >
                <Icon className="w-8 h-8" style={{ color: 'var(--fallout-cream)' }} strokeWidth={2.5} />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  color: 'var(--fallout-charcoal)',
                  letterSpacing: '0.08em'
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: 'var(--fallout-brown)' }}>
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
