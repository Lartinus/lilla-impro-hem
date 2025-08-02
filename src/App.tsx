import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const LazyAdminDashboard = lazy(() => import("./components/LazyAdminDashboard"));
const Shows = lazy(() => import("./pages/Shows"));
const ShowDetails = lazy(() => import("./pages/ShowDetails"));
const Courses = lazy(() => import("./pages/Courses"));

// Keep critical pages as regular imports for faster initial load
import Index from "./pages/Index";
import About from "./pages/About";
import Lokal from "./pages/Lokal";
import BokaOss from "./pages/BokaOss";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import NewsletterConfirmation from "./pages/NewsletterConfirmation";
import CoursePaymentSuccess from "./pages/CoursePaymentSuccess";
import TicketPaymentSuccess from "./pages/TicketPaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";

// Create query client with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - increased from 30 minutes for fresher data
      gcTime: 10 * 60 * 1000, // 10 minutes - reduced from 2 hours
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // Reduce unnecessary refetches
    },
  },
});

const PageSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-12 w-64 mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/boka-oss" element={<BokaOss />} />
            <Route path="/om-oss" element={<About />} />
            <Route path="/lokal" element={<Lokal />} />
            <Route 
              path="/kurser" 
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Courses />
                </Suspense>
              } 
            />
            <Route 
              path="/shows" 
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Shows />
                </Suspense>
              } 
            />
            <Route 
              path="/shows/:slug" 
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <ShowDetails />
                </Suspense>
              } 
            />
            <Route path="/kurser/tack" element={<CoursePaymentSuccess />} />
            <Route path="/shows/tack" element={<TicketPaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/avprenumerera" element={<Unsubscribe />} />
            <Route path="/nyhetsbrev-bekraftelse" element={<NewsletterConfirmation />} />
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <LazyAdminDashboard />
                </Suspense>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
