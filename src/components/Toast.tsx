/**
 * Toast Notification Component
 */

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: number;
  msg: string;
  kind?: 'ok' | 'warn';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="no-print pointer-events-none fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-6"
      aria-live="polite"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex animate-pop items-center gap-2 rounded-full border bg-surface-solid px-4 py-2 text-xs font-semibold shadow-float ${
            t.kind === 'warn'
              ? 'border-warn text-warn'
              : 'border-line text-ink'
          }`}
        >
          {t.kind === 'warn' ? (
            <AlertCircle size={15} className="text-warn flex-none" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-500 flex-none" />
          )}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};
