import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '@/components/ui/toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        type,
        title,
        description,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) => {
      return showToast('success', title, description);
    },
    [showToast],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      return showToast('error', title, description, 7000);
    },
    [showToast],
  );

  const info = useCallback(
    (title: string, description?: string) => {
      return showToast('info', title, description);
    },
    [showToast],
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      return showToast('warning', title, description);
    },
    [showToast],
  );

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast,
  };
}


