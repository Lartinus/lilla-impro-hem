import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

const NewsletterConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleConfirmation = async () => {
      // Check for URL error parameters first
      if (error === 'invalid-token') {
        setStatus('error');
        setMessage('Ogiltig bekräftelselänk. Vänligen kontakta oss om problemet kvarstår.');
        return;
      }
      
      if (error === 'expired') {
        setStatus('error');
        setMessage('Bekräftelselänken har gått ut. Vänligen registrera dig igen för nyhetsbrevet.');
        return;
      }

      if (error === 'already-confirmed') {
        setStatus('already_confirmed');
        setMessage('Din e-postadress är redan bekräftad för vårt nyhetsbrev.');
        return;
      }

      if (!token) {
        setStatus('error');
        setMessage('Bekräftelsetoken saknas. Vänligen kontakta oss direkt.');
        return;
      }

      // If we have a token and no error, the confirmation was successful
      console.log(`Newsletter confirmation completed for token: ${token}`);
      setStatus('success');
      setMessage('Tack! Din prenumeration på vårt nyhetsbrev är nu bekräftad.');
    };

    handleConfirmation();
  }, [token, error]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-muted-foreground animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-red-600" />;
      case 'already_confirmed':
        return <Mail className="w-16 h-16 text-blue-600" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Bekräftar prenumeration...';
      case 'success':
        return 'Prenumeration bekräftad!';
      case 'already_confirmed':
        return 'Redan bekräftad';
      case 'error':
        return 'Fel vid bekräftelse';
    }
  };

  const getCardVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'already_confirmed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background font-satoshi">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/uploads/LIT_red_large.png" 
              alt="Lilla Improteatern" 
              className="mx-auto w-32 h-auto mb-6"
            />
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getIcon()}
              </div>
              <CardTitle className="text-2xl">
                {getTitle()}
              </CardTitle>
              <CardDescription className="text-lg">
                Nyhetsbrevsprenumeration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {status === 'success' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Tack! Din prenumeration på vårt nyhetsbrev är nu bekräftad.
                  </p>
                  
                  <p className="text-muted-foreground">
                    Du kommer nu att få våra nyhetsbrev och information om kommande föreställningar och kurser.
                  </p>
                  
                  <p className="text-muted-foreground">
                    Välkommen till Lilla Improteaterns community! Vi ser fram emot att dela våra senaste nyheter med dig.
                  </p>
                </div>
              )}

              {status !== 'success' && (
                <p className="text-muted-foreground">
                  {message}
                </p>
              )}

              {status === 'already_confirmed' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-400">
                    Du är redan registrerad för vårt nyhetsbrev och kommer att få våra senaste uppdateringar.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-red-700 dark:text-red-400">
                      Om problemet kvarstår, vänligen kontakta oss direkt på info@improteatern.se
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Försök registrera dig igen
                  </Button>
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

export default NewsletterConfirmation;