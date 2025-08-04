import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CourseOffer {
  id: string;
  course_instance_id: string;
  course_title: string;
  course_table_name: string;
  course_price: number;
  course_discount_price: number;
  waitlist_name: string;
  waitlist_email: string;
  expires_at: string;
  status: string;
  start_date?: string;
}

const CourseOfferPayment = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<CourseOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<'regular' | 'discount'>('regular');

  useEffect(() => {
    if (!token) {
      setError('Ogiltig länk');
      setLoading(false);
      return;
    }

    fetchOffer();
  }, [token]);

  const fetchOffer = async () => {
    try {
      // First get the course offer
      const { data: offerData, error: offerError } = await supabase
        .from('course_offers')
        .select('id, course_instance_id, course_title, course_table_name, course_price, course_discount_price, waitlist_name, waitlist_email, expires_at, status')
        .eq('offer_token', token)
        .eq('status', 'sent')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (offerError || !offerData) {
        setError('Erbjudandet har gått ut eller finns inte längre');
        return;
      }

      // Then get the course start date
      const { data: instanceData } = await supabase
        .from('course_instances')
        .select('start_date')
        .eq('id', offerData.course_instance_id)
        .single();

      setOffer({
        ...offerData,
        start_date: instanceData?.start_date
      });
    } catch (err) {
      console.error('Error fetching offer:', err);
      setError('Kunde inte ladda erbjudandet');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!offer || !token) return;

    setIsProcessing(true);
    try {
      const finalPrice = selectedPrice === 'discount' ? offer.course_discount_price : offer.course_price;
      
      // Create Stripe checkout session for the course offer
      const { data, error } = await supabase.functions.invoke('create-course-checkout', {
        body: {
          courseInstanceId: offer.course_instance_id,
          courseTitle: offer.course_title,
          courseTableName: offer.course_table_name,
          price: offer.course_price,
          discountPrice: offer.course_discount_price,
          useDiscountPrice: selectedPrice === 'discount',
          buyerName: offer.waitlist_name,
          buyerEmail: offer.waitlist_email,
          buyerPhone: '',
          buyerAddress: '',
          buyerPostalCode: '',
          buyerCity: '',
          buyerMessage: '',
          offerToken: token
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Ingen betalningslänk mottogs');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Kunde inte starta betalning. Försök igen.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Fel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Tillbaka till startsidan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  const expiresAt = new Date(offer.expires_at);
  const timeLeft = expiresAt.getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const finalPrice = selectedPrice === 'discount' ? offer.course_discount_price : offer.course_price;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-4">
          <h2 className="text-2xl font-bold pt-4">Du har erbjudits en plats!</h2>
          <CardDescription>
            Säkra din plats i kursen genom att betala nedan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">{offer.course_title}</h3>
            {offer.start_date && (
              <p className="text-muted-foreground">
                Kursen börjar: {new Date(offer.start_date).toLocaleDateString('sv-SE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Erbjudandet gäller:</span>
              <span className="text-sm">
                {timeLeft > 0 
                  ? `${hoursLeft}h ${minutesLeft}m kvar`
                  : 'Utgånget'
                }
              </span>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Välj pris:</Label>
              <RadioGroup value={selectedPrice} onValueChange={(value: 'regular' | 'discount') => setSelectedPrice(value)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>Ordinarie pris</span>
                      <span className="font-bold">{offer.course_price} kr</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="discount" id="discount" />
                  <Label htmlFor="discount" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>Studentpris</span>
                      <span className="font-bold">{offer.course_discount_price} kr</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">Att betala:</span>
                <span className="text-xl font-bold text-primary">{finalPrice} kr</span>
              </div>
            </div>
          </div>

          {timeLeft > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Du måste betala senast {expiresAt.toLocaleDateString('sv-SE')} kl {expiresAt.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} för att säkra din plats.
              </p>
              
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Behandlar...
                  </>
                ) : (
                  `Betala ${finalPrice} kr`
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-destructive mb-4">Detta erbjudande har gått ut.</p>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Tillbaka till startsidan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseOfferPayment;