import { useEffect, useState, useRef } from "react";

const TYPING_SPEED = 24;

export function useAnimatedText(text: string, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !text) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length >= text.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return text;
        }
        return text.slice(0, prev.length + 1);
      });
    }, TYPING_SPEED);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, enabled]);

  if (!enabled || !text) {
    return text;
  }

  return displayedText.length > text.length ? text : displayedText;
}
