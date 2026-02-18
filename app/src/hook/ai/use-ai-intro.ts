import { useEffect, useState } from "react";

const AI_INTRO_MSG = `🍿 Prêt pour une soirée film ou série ?
Dis-moi ce que tu as envie de regarder, je m’occupe du reste.`

const WRITE_SPEED = 16

export default function useAiIntro() {
  const text = AI_INTRO_MSG
    
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, WRITE_SPEED); // vitesse d’écriture

      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return displayedText;
}