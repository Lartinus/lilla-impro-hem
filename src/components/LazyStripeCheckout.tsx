
import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const StripeCheckout = lazy(() => import('./StripeCheckout'))

interface LazyStripeCheckoutProps {
  showSlug: string;
  showTitle: string;
  showDate: string;
  showLocation: string;
  regularTickets: number;
  discountTickets: number;
  discountCode: string;
  ticketPrice: number;
  discountPrice: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  onBack: () => void;
}

const StripeCheckoutSkeleton = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold mb-2">Laddar betalning...</h3>
      <p className="text-sm text-muted-foreground">
        Förbereder säker betalning med Stripe...
      </p>
    </div>
    
    <div className="flex space-x-4">
      <Button 
        onClick={onBack}
        variant="outline"
        className="rounded-none"
      >
        Tillbaka
      </Button>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Laddar...
      </Button>
    </div>
  </div>
)

export default function LazyStripeCheckout(props: LazyStripeCheckoutProps) {
  return (
    <Suspense fallback={<StripeCheckoutSkeleton onBack={props.onBack} />}>
      <StripeCheckout {...props} />
    </Suspense>
  )
}
