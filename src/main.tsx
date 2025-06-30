
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { useOptimizedPrefetch } from '@/hooks/useOptimizedPrefetch';

// Create query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to trigger optimized prefetch
const PrefetchProvider = ({ children }: { children: React.ReactNode }) => {
  useOptimizedPrefetch();
  return <>{children}</>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PrefetchProvider>
          <App />
        </PrefetchProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
