import { useEffect, useRef } from 'react';
import styles from './Game.module.css';

interface GameDialogProps {
  open: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose?: () => void;
}

export function GameDialog({
  open,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: GameDialogProps) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    primaryRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-dialog-title"
        aria-describedby="game-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className={styles.dialogIcon} aria-hidden="true">
          ✦
        </span>
        <h3 id="game-dialog-title">{title}</h3>
        <p id="game-dialog-description">{message}</p>
        <div className={styles.dialogActions}>
          {secondaryLabel && onSecondary ? (
            <button className={styles.secondaryButton} type="button" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
          {onClose ? (
            <button className={styles.secondaryButton} type="button" onClick={onClose}>
              取消
            </button>
          ) : null}
          <button
            className={styles.primaryButton}
            type="button"
            onClick={onPrimary}
            ref={primaryRef}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
