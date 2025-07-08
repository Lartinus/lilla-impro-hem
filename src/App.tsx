import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { useOptimizedPrefetch } from '@/hooks/useOptimizedPrefetch';
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Corporate from "./pages/Corporate";
import About from "./pages/About";
import Shows from "./pages/Shows";
import ShowDetails from "./pages/ShowDetails";
import Mohippa from "./pages/Mohippa";
import NotFound from "./pages/NotFound";
import TicketPreviewPage from "./pages/TicketPreviewPage";
import CourseConfirmationPreviewPage from "./pages/CourseConfirmationPreviewPage";
import Unsubscribe from "./pages/Unsubscribe";
import AdminDashboard from "./pages/Admin";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PrefetchProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/kurser" element={<Courses />} />
              <Route path="/foretag" element={<Corporate />} />
              <Route path="/mohippa" element={<Mohippa />} />
              <Route path="/om-oss" element={<About />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/shows/:slug" element={<ShowDetails />} />
              <Route path="/biljett" element={<TicketPreviewPage />} />
              <Route path="/kursanmälan" element={<CourseConfirmationPreviewPage />} />
              <Route path="/avprenumerera" element={<Unsubscribe />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PrefetchProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
