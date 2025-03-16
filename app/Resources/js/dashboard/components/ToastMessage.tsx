import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster, toast } from 'sonner';

const ToastMessage = () => {
  const el = document.getElementById('toaster') as HTMLElement;
  ReactDOM.createRoot(el).render(<Toaster richColors />);

  const colorClasses: Record<
    'success' | 'error' | 'info' | 'warning' | 'loading',
    string
  > = {
    success: 'text-green-900',
    error: 'text-red-900',
    info: 'text-blue-900',
    warning: 'text-yellow-900',
    loading: 'text-gray-900',
  };

  // Listen for custom toast events
  document.addEventListener('show-toast', (event: Event) => {
    const customEvent = event as CustomEvent<{
      type: string;
      title: string;
      message: string;
    }>;
    const { type, title, message } = customEvent.detail;

    toast[type as 'success' | 'error' | 'info' | 'warning' | 'loading'](
      title as string,
      {
        description: (
          <p
            className={`text-sm font-semibold ${colorClasses[type as keyof typeof colorClasses]}`}
          >
            {message}
          </p>
        ),
        duration: 1500,
      },
    );
  });
};

export default ToastMessage;
