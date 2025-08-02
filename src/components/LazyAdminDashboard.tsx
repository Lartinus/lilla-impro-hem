
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the admin dashboard
const AdminDashboard = lazy(() => import('../pages/Admin'))

const AdminDashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <Skeleton className="h-64 w-full" />
        </div>
        {/* Content skeleton */}
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  </div>
)

export default function LazyAdminDashboard() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  )
}
