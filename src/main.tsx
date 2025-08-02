
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes default stale time
      gcTime: 5 * 60 * 1000, // 5 minutes cache time (was cacheTime)
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnReconnect: 'always', // Always refetch on reconnect
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 408)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Retry mutations once
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Enable query deduplication
queryClient.setQueryDefaults(['admin-show-cards'], {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

queryClient.setQueryDefaults(['admin-course-cards'], {
  staleTime: 2 * 60 * 1000, 
  gcTime: 10 * 60 * 1000,
});

// Longer cache for rarely changing data
queryClient.setQueryDefaults(['venues-optimized'], {
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});

queryClient.setQueryDefaults(['show-templates-optimized'], {
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
