import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
export function useAmbientMotion(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = true;
    const sync = () => {
      element.dataset.paused = String(document.hidden || !visible);
    };
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            sync();
          })
        : null;
    observer?.observe(element);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return ref;
}
