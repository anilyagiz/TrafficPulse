'use client';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-6 right-6 z-50 flex flex-col gap-3"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-label={`${toast.type}: ${toast.message}`}
          className={`animate-fadeIn glass-card px-5 py-3 flex items-center gap-3 min-w-[300px] max-w-md ${
            toast.type === 'success' ? 'border-green-500/30' :
            toast.type === 'error' ? 'border-red-500/30' : 'border-cyan-500/30'
          }`}
        >
          <span className="text-lg" aria-hidden="true">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="text-sm text-white">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}