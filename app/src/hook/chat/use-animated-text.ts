import { useEffect, useState, useRef } from "react";

const TYPING_SPEED = 24;

export function useAnimatedText(text: string, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      return;
    }

    if (index < text.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, TYPING_SPEED);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [index, text, enabled]);

  return displayedText;
}
