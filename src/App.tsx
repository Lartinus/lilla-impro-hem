
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
// Removed performance monitoring hooks for better performance

// Static imports for critical path
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

// Skeleton components
import CoursesSkeleton from '@/components/skeletons/CoursesSkeleton';
import ShowsSkeleton from '@/components/skeletons/ShowsSkeleton';
import ShowDetailsSkeleton from '@/components/skeletons/ShowDetailsSkeleton';
import BokaOssSkeleton from '@/components/skeletons/BokaOssSkeleton';
import LokalSkeleton from '@/components/skeletons/LokalSkeleton';
import AdminSkeleton from '@/components/skeletons/AdminSkeleton';

// Lazy imports for better code splitting
const LazyShows = React.lazy(() => import('@/pages/Shows'));
const LazyCourses = React.lazy(() => import('@/pages/Courses'));
const LazyLokal = React.lazy(() => import('@/pages/Lokal'));
const LazyBokaOss = React.lazy(() => import('@/pages/BokaOss'));
const LazyShowDetails = React.lazy(() => import('@/pages/ShowDetails'));
const LazyAdmin = React.lazy(() => import('@/pages/Admin'));
const LazyTicketSuccess = React.lazy(() => import('@/pages/TicketPaymentSuccess'));
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


function App() {
  // Performance optimized - removed monitoring overhead

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
          <Suspense fallback={null}>
              <Routes>
                {/* Critical routes - loaded immediately */}
                <Route path="/" element={<Index />} />
                <Route path="/om-oss" element={<About />} />
                
                {/* Redirect for backward compatibility */}
                <Route path="/shows" element={<Navigate to="/forestallningar" replace />} />
                
                {/* Lazy loaded routes with intelligent prefetching */}
                <Route 
                  path="/forestallningar" 
                  element={
                    <Suspense fallback={<ShowsSkeleton />}>
                      <LazyShows />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/kurser" 
                  element={
                    <Suspense fallback={<CoursesSkeleton />}>
                      <LazyCourses />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/lokal" 
                  element={
                    <Suspense fallback={<LokalSkeleton />}>
                      <LazyLokal />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/boka-oss" 
                  element={
                    <Suspense fallback={<BokaOssSkeleton />}>
                      <LazyBokaOss />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/forestallningar/:slug" 
                  element={
                    <Suspense fallback={<ShowDetailsSkeleton />}>
                      <LazyShowDetails />
                    </Suspense>
                  } 
                />
                
                {/* Admin routes - heavily optimized */}
                <Route 
                  path="/admin/*" 
                  element={
                    <Suspense fallback={<AdminSkeleton />}>
                      <LazyAdmin />
                    </Suspense>
                  } 
                />
                
                 {/* Ticket confirmation route */}
                <Route 
                  path="/forestallningar/tack" 
                  element={
                    <Suspense fallback={null}>
                      <LazyTicketSuccess />
                    </Suspense>
                  } 
                />
                
                {/* Payment routes - grouped */}
                <Route 
                  path="/payment/*" 
                  element={
                    <Suspense fallback={null}>
                      <LazyPaymentPages />
                    </Suspense>
                  } 
                />
                
                {/* Newsletter routes - grouped */}
                <Route 
                  path="/newsletter/*" 
                  element={
                    <Suspense fallback={null}>
                      <LazyNewsletterPages />
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
