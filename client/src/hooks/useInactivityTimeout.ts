import { useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

export function useInactivityTimeout(onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onTimeout, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on any activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [onTimeout]);
}
