
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Corporate from "./pages/Corporate";
import About from "./pages/About";
import Shows from "./pages/Shows";
import ShowDetails from "./pages/ShowDetails";
import Mohippa from "./pages/Mohippa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/foretag" element={<Corporate />} />
            <Route path="/mohippa" element={<Mohippa />} />
            <Route path="/om-oss" element={<About />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/:slug" element={<ShowDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
