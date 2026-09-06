import { useEffect, useState } from 'react';

export function motionDuration(token: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
}

// Timers only settle presentation; gameplay never waits for an animation event.
export function useTimedFeedback(id: number | null, token: string, disabled = false): boolean {
  const [settled, setSettled] = useState<number | null>(null);
  useEffect(() => {
    if (id === null) return;
    const finish = () => setSettled(id);
    const timeout = window.setTimeout(finish, disabled ? 0 : motionDuration(token));
    const onVisibility = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [id, token, disabled]);
  return !disabled && id !== null && id !== settled;
}
