import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  descriptionId?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

/**
 * WCAG 2.2 AA compliant Modal Dialog with focus trap, focus restoration,
 * Escape key handling, and ARIA attributes.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  ariaLabel,
  children,
  maxWidthClass = 'max-w-lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element for focus restoration
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Find first focusable element inside the modal
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const modalNode = modalRef.current;
    if (modalNode) {
      const focusableElements = modalNode.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus();
      } else {
        modalNode.focus();
      }
    }

    // Keydown handler for Escape and Focus Trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore focus to original triggering element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`bg-surface-container-lowest rounded-2xl w-full ${maxWidthClass} p-space-lg shadow-2xl border border-outline-variant/40 space-y-space-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
      >
        {children}
      </div>
    </div>
  );
};
