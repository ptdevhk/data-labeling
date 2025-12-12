import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@douyinfe/semi-ui/dist/css/semi.css';
import './index.css';
import App from './App';

if (import.meta.env.DEV) {
  const suppressedTokens = ['findDOMNode'];

  const shouldSuppress = (args: unknown[]) =>
    args.some(
      (arg) =>
        typeof arg === 'string' &&
        suppressedTokens.some((token) => arg.includes(token))
    );

  const filterConsoleMethod = (method: 'warn' | 'error') => {
    const original = console[method].bind(console);

    console[method] = ((...args: unknown[]) => {
      if (shouldSuppress(args)) {
        return;
      }

      original(...args);
    }) as typeof console.warn;
  };

  filterConsoleMethod('warn');
  filterConsoleMethod('error');
}

// Configure TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error handling for authentication-related errors
queryClient.setQueryDefaults(['auth'], {
  gcTime: 0,
});

queryClient.getQueryCache().config.onError = (error) => {
  console.error('Query error:', error);
};

queryClient.getMutationCache().config.onError = (error) => {
  console.error('Mutation error:', error);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
