import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useSectionReveal(): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section || !('IntersectionObserver' in window)) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let seen = false;
    const show = () => {
      seen = true;
      section.dataset.reveal = 'visible';
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !seen) {
          seen = true;
          section.dataset.reveal = media.matches ? 'visible' : 'enter';
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(section);
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a');
      if (link?.hash === `#${section.id}`) {
        show();
        if (section.id === 'game') section.focus({ preventScroll: true });
      }
    };
    const onHash = () => {
      if (window.location.hash === `#${section.id}`) show();
    };
    const onMotion = () => {
      if (media.matches) show();
    };
    if (section.contains(document.activeElement)) show();
    onHash();
    onMotion();
    section.addEventListener('focusin', show);
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    media.addEventListener('change', onMotion);
    return () => {
      observer.disconnect();
      section.removeEventListener('focusin', show);
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
      media.removeEventListener('change', onMotion);
    };
  }, []);
  return ref;
}
