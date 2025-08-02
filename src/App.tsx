
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { usePerformanceMonitor, logBundleInfo } from '@/hooks/usePerformanceMonitor';

// Static imports for critical path
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

// Lazy imports for better code splitting
const LazyShows = React.lazy(() => import('@/pages/Shows'));
const LazyCourses = React.lazy(() => import('@/pages/Courses'));
const LazyLokal = React.lazy(() => import('@/pages/Lokal'));
const LazyBokaOss = React.lazy(() => import('@/pages/BokaOss'));
const LazyShowDetails = React.lazy(() => import('@/pages/ShowDetails'));
const LazyAdmin = React.lazy(() => 
  import('@/components/LazyAdminDashboard').then(module => ({ 
    default: module.LazyAdminDashboard 
  }))
);
const LazyStripeCheckout = React.lazy(() => 
  import('@/components/LazyStripeCheckout').then(module => ({ 
    default: module.LazyStripeCheckout 
  }))
);
const LazyPaymentPages = React.lazy(() => 
  Promise.all([
    import('@/pages/TicketPaymentSuccess'),
    import('@/pages/CoursePaymentSuccess'),
    import('@/pages/PaymentCancelled'),
  ]).then(([ticketSuccess, courseSuccess, cancelled]) => ({
    default: () => (
      <Routes>
        <Route path="/ticket-success" element={<ticketSuccess.default />} />
        <Route path="/course-success" element={<courseSuccess.default />} />
        <Route path="/payment-cancelled" element={<cancelled.default />} />
      </Routes>
    )
  }))
);
const LazyNewsletterPages = React.lazy(() =>
  Promise.all([
    import('@/pages/NewsletterConfirmation'),
    import('@/pages/Unsubscribe'),
  ]).then(([confirmation, unsubscribe]) => ({
    default: () => (
      <Routes>
        <Route path="/newsletter-confirmation" element={<confirmation.default />} />
        <Route path="/unsubscribe" element={<unsubscribe.default />} />
      </Routes>
    )
  }))
);

// Optimized loading component
const LoadingFallback = ({ message = "Laddar..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

function App() {
  // Monitor performance improvements
  usePerformanceMonitor();
  
  // Log bundle info in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logBundleInfo();
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Critical routes - loaded immediately */}
                <Route path="/" element={<Index />} />
                <Route path="/om-oss" element={<About />} />
                
                {/* Lazy loaded routes */}
                <Route 
                  path="/forestallningar" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar föreställningar..." />}>
                      <LazyShows />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/kurser" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar kurser..." />}>
                      <LazyCourses />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/lokal" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar lokalinfo..." />}>
                      <LazyLokal />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/boka-oss" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar bokningsformulär..." />}>
                      <LazyBokaOss />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/forestallningar/:slug" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar föreställning..." />}>
                      <LazyShowDetails />
                    </Suspense>
                  } 
                />
                
                {/* Admin routes - heavily optimized */}
                <Route 
                  path="/admin/*" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar administratörspanel..." />}>
                      <LazyAdmin />
                    </Suspense>
                  } 
                />
                
                {/* Payment routes - grouped */}
                <Route 
                  path="/payment/*" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar betalning..." />}>
                      <LazyPaymentPages />
                    </Suspense>
                  } 
                />
                
                {/* Newsletter routes - grouped */}
                <Route 
                  path="/newsletter/*" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Laddar nyhetsbrev..." />}>
                      <LazyNewsletterPages />
                    </Suspense>
                  } 
                />
                
                {/* Stripe checkout */}
                <Route 
                  path="/stripe-checkout" 
                  element={
                    <Suspense fallback={<LoadingFallback message="Förbereder betalning..." />}>
                      <LazyStripeCheckout />
                    </Suspense>
                  } 
                />
                
                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
