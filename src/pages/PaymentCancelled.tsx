import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EBEBEB' }}>
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/20 backdrop-blur-sm" style={{ backgroundColor: '#F3F3F3' }}>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-3xl text-foreground mb-2">
                  Betalning avbruten
                </h1>
                <p className="text-muted-foreground">
                  Din betalning har avbrutits och inga avgifter har debiterats.
                </p>
              </div>

              <div className="bg-destructive/5 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-foreground mb-4">
                  Vad händer nu?
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Din plats/biljett är inte reserverad</li>
                  <li>Inga pengar har dragits från ditt kort</li>
                  <li>Du kan försöka igen när som helst</li>
                  <li>Kontakta oss om du har tekniska problem</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/kurser">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Försök igen - Kurser
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/shows">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Försök igen - Föreställningar
                  </Link>
                </Button>
              </div>

              <div className="mt-6">
                <Button variant="ghost" asChild>
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tillbaka till startsidan
                  </Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Behöver du hjälp? Kontakta oss på{' '}
                  <a href="mailto:kontakt@improteatern.se" className="text-primary hover:underline">
                    kontakt@improteatern.se
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelled;