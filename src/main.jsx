import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import App from '@/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <ThemeModeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeModeProvider>
    </QueryProvider>
  </StrictMode>,
);
