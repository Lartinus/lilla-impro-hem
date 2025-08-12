
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
// Removed performance monitoring hooks for better performance

// Static imports for critical path
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';
import { TicketScanning } from '@/pages/TicketScanning';

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
const LazyCourseSuccess = React.lazy(() => import('@/pages/CoursePaymentSuccess'));
const LazyCourseOfferPayment = React.lazy(() => import('@/pages/CourseOfferPayment'));
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
const LazyNewsletterConfirmation = React.lazy(() => import('@/pages/NewsletterConfirmation'));
const LazyUnsubscribe = React.lazy(() => import('@/pages/Unsubscribe'));
const LazyIntegritet = React.lazy(() => import('@/pages/Integritet'));


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isScanRoute = location.pathname === '/scan';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdminRoute && !isScanRoute && <Header />}
      <main className="flex-1">
        <Suspense fallback={null}>
          <Routes>
            {/* Critical routes - loaded immediately */}
            <Route path="/" element={<Index />} />
            <Route path="/om-oss" element={<About />} />
            <Route path="/scan" element={<TicketScanning />} />
            
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
            
            {/* Course confirmation route */}
            <Route 
              path="/kurser/tack" 
              element={
                <Suspense fallback={null}>
                  <LazyCourseSuccess />
                </Suspense>
              } 
            />
            
            {/* Course offer payment route */}
            <Route 
              path="/course-offer-payment/:token" 
              element={
                <Suspense fallback={null}>
                  <LazyCourseOfferPayment />
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
            
            {/* Newsletter confirmation route */}
            <Route 
              path="/nyhetsbrev-bekraftelse" 
              element={
                <Suspense fallback={null}>
                  <LazyNewsletterConfirmation />
                </Suspense>
              } 
            />
            
            {/* Newsletter unsubscribe route */}
            <Route 
              path="/unsubscribe" 
              element={
                <Suspense fallback={null}>
                  <LazyUnsubscribe />
                </Suspense>
              } 
            />
            
            {/* Integritetspolicy */}
            <Route 
              path="/integritet" 
              element={
                <Suspense fallback={null}>
                  <LazyIntegritet />
                </Suspense>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
