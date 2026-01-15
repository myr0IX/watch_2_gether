"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeroSection } from "@/components/home/hero-section";
import { ChatBot } from "@/components/ai/chat-bot";

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showChat ? (
        <motion.div
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection onStartChat={() => setShowChat(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ChatBot />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
