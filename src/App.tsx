
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePrefetch } from "@/hooks/usePrefetch";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import ShowDetails from "./pages/ShowDetails";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Corporate from "./pages/Corporate";
import Mohippa from "./pages/Mohippa";
import NotFound from "./pages/NotFound";
import AuthProvider from "./components/auth/AuthProvider";

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes default
      gcTime: 30 * 60 * 1000, // 30 minutes default
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
    },
  },
});

const AppContent = () => {
  // Use optimized prefetch strategy
  usePrefetch();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/shows" element={<Shows />} />
      <Route path="/shows/:slug" element={<ShowDetails />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/kurser" element={<Courses />} />
      <Route path="/about" element={<About />} />
      <Route path="/om-oss" element={<About />} />
      <Route path="/corporate" element={<Corporate />} />
      <Route path="/foretag" element={<Corporate />} />
      <Route path="/mohippa" element={<Mohippa />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
            <AppContent />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
