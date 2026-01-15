"use client";

import { motion } from "motion/react";
import { Film } from "lucide-react";

export function AnimatedTitle() {
  const title = "Watch 2 Gether";

  return (
    <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto text-center">
      {/* Film Icon - Fallout yellow glow */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
        className="relative"
      >
        <div
          className="absolute inset-0 blur-md opacity-50"
          style={{ backgroundColor: 'var(--fallout-yellow)' }}
        />
        <Film
          className="w-20 h-20 md:w-24 md:h-24 relative z-10"
          style={{ color: 'var(--fallout-brass)' }}
          strokeWidth={2}
        />
      </motion.div>

      {/* Titre principal - Art Deco with yellow text shadow */}
      <motion.h1
        className="text-6xl md:text-8xl font-bold tracking-tight"
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          color: 'var(--fallout-charcoal)',
          textShadow: '2px 2px 0px var(--fallout-yellow)',
          letterSpacing: '0.1em',
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {title}
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-xl md:text-2xl font-medium"
        style={{
          fontFamily: 'Inter, sans-serif',
          color: 'var(--fallout-brown)'
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Tes films et séries, recommandés par intelligence artificielle
      </motion.p>
    </div>
  );
}
