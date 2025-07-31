import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";

import Index from "./pages/Index";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Lokal from "./pages/Lokal";
import Shows from "./pages/Shows";
import ShowDetails from "./pages/ShowDetails";
import BokaOss from "./pages/BokaOss";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import NewsletterConfirmation from "./pages/NewsletterConfirmation";
import AdminDashboard from "./pages/Admin";
import CoursePaymentSuccess from "./pages/CoursePaymentSuccess";
import TicketPaymentSuccess from "./pages/TicketPaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";

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


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kurser" element={<Courses />} />
            <Route path="/boka-oss" element={<BokaOss />} />
            <Route path="/om-oss" element={<About />} />
            <Route path="/lokal" element={<Lokal />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/:slug" element={<ShowDetails />} />
            <Route path="/kurser/tack" element={<CoursePaymentSuccess />} />
            <Route path="/shows/tack" element={<TicketPaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/avprenumerera" element={<Unsubscribe />} />
            <Route path="/nyhetsbrev-bekraftelse" element={<NewsletterConfirmation />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
