import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const email = searchParams.get('email');
  const error = searchParams.get('error');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleUnsubscribe = async () => {
      // Check for URL error parameters first
      if (error === 'missing-email') {
        setStatus('error');
        setMessage('E-postadress saknas. Vänligen kontakta oss direkt för att avprenumerera.');
        return;
      }
      
      if (error === 'processing') {
        setStatus('error');
        setMessage('Ett fel uppstod vid avprenumerationen. Vänligen försök igen senare eller kontakta oss direkt.');
        return;
      }

      if (!email) {
        setStatus('error');
        setMessage('E-postadress saknas. Vänligen kontakta oss direkt för att avprenumerera.');
        return;
      }

      try {
        console.log(`Processing unsubscribe for: ${email}`);
        
        // Call the newsletter-unsubscribe edge function
        const { data, error: unsubscribeError } = await supabase.functions.invoke('newsletter-unsubscribe', {
          body: { email: email }
        });

        if (unsubscribeError) {
          throw unsubscribeError;
        }

        console.log(`Unsubscribe completed successfully for: ${email}`);
        setStatus('success');
        setMessage('Du har framgångsrikt avprenumererat från våra utskick.');
      } catch (err) {
        console.error('Error processing unsubscribe:', err);
        setStatus('error');
        setMessage('Ett fel uppstod vid avprenumerationen. Vänligen försök igen senare eller kontakta oss direkt.');
      }
    };

    handleUnsubscribe();
  }, [email, error]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-muted-foreground animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Bearbetar avprenumeration...';
      case 'success':
        return 'Avprenumeration lyckades!';
      case 'error':
        return 'Fel vid avprenumeration';
    }
  };

  return (
    <div className="min-h-screen bg-background font-satoshi">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getIcon()}
              </div>
              <CardTitle className="text-2xl">
                {getTitle()}
              </CardTitle>
              {email && (
                <CardDescription className="text-lg">
                  E-postadress: <strong>{email}</strong>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                {message}
              </p>

              {status === 'success' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">
                        Vi kommer inte längre att skicka nyhetsbrev eller andra mejl till denna adress.
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Tack för din tid med oss! Om du ändrar dig kan du alltid anmäla dig igen via våra kurser eller föreställningar.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">
                    Om problemet kvarstår, vänligen kontakta oss direkt på info@improteatern.se
                  </p>
                </div>
              )}

              <div className="pt-6 border-t">
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Tillbaka till startsidan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Unsubscribe;