import { useEffect, useState } from 'react';

export const trackedSectionIds = ['introduction', 'how-to-play', 'game'] as const;
export type TrackedSectionId = (typeof trackedSectionIds)[number];

function readHeaderReferenceLine(): number {
  const rawHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
  const headerHeight = Number.parseFloat(rawHeight) || 72;
  return headerHeight + 24;
}

export function useActiveSection(): TrackedSectionId | null {
  const [activeSection, setActiveSection] = useState<TrackedSectionId | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const referenceLine = readHeaderReferenceLine();
      let nextSection: TrackedSectionId | null = null;
      for (const id of trackedSectionIds) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= referenceLine) nextSection = id;
      }
      setActiveSection((current) => (current === nextSection ? current : nextSection));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return activeSection;
}
