import { useEffect, useState, useRef } from "react";

const TYPING_SPEED = 24;

export function useAnimatedText(text: string, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    indexRef.current = 0;

    const tick = () => {
      setDisplayedText((prev) =>
        indexRef.current === 0 ? text[0] : prev + text[indexRef.current],
      );

      indexRef.current++;

      if (indexRef.current < text.length) {
        timeoutRef.current = setTimeout(tick, TYPING_SPEED);
      }
    };

    timeoutRef.current = setTimeout(tick, TYPING_SPEED);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, enabled]);

  return enabled ? displayedText : text;
}
