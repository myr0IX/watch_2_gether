"use client";

import { Brain, Gift, Heart } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Brain,
    title: "Propulsé par Mistral AI",
    description: "Intelligence artificielle de pointe pour des recommandations pertinentes"
  },
  {
    icon: Gift,
    title: "100% Gratuit",
    description: "Aucun abonnement, aucune carte bancaire, aucun engagement"
  },
  {
    icon: Heart,
    title: "Personnalisé",
    description: "S'adapte à tes goûts et découvre de nouvelles pépites"
  }
];

export function Features() {
  return (
    <section className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-4">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={i}
              className="flex items-start gap-4 p-4 rounded-sm"
              style={{
                backgroundColor: 'var(--fallout-tan)',
                border: '2px solid var(--fallout-border)'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 + (i * 0.1) }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'var(--fallout-green)',
                  border: '2px solid var(--fallout-brass)'
                }}
              >
                <Icon className="w-5 h-5" style={{ color: 'var(--fallout-cream)' }} strokeWidth={2.5} />
              </div>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    color: 'var(--fallout-charcoal)',
                    letterSpacing: '0.08em'
                  }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--fallout-brown)' }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
