import { useEffect, useId, useRef } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    primaryRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) onClose();
      if (event.key === 'Tab') {
        const buttons =
          dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        const first = buttons?.[0];
        const last = buttons?.[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className={styles.dialogIcon} aria-hidden="true">
          ✦
        </span>
        <h3 id={titleId}>{title}</h3>
        <p id={descriptionId}>{message}</p>
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
