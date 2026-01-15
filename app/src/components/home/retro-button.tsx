"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface RetroButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export function RetroButton({ onClick, children }: RetroButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="px-8 py-4 text-2xl font-bold tracking-wider rounded-sm transition-colors relative overflow-hidden"
      style={{
        fontFamily: 'Bebas Neue, sans-serif',
        backgroundColor: 'var(--fallout-yellow)',
        color: 'var(--fallout-charcoal)',
        border: '3px solid var(--fallout-brass)',
        boxShadow: '0 6px 0px var(--fallout-brass), 0 8px 20px var(--fallout-shadow)',
        letterSpacing: '0.15em',
      }}
      whileHover={{
        scale: 1.02,
        backgroundColor: 'var(--fallout-orange)',
        y: -2,
      }}
      whileTap={{
        scale: 0.98,
        y: 2,
        boxShadow: '0 2px 0px var(--fallout-brass), 0 4px 10px var(--fallout-shadow)'
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
