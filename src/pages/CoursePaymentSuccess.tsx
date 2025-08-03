import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Mail, Calendar, User, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

interface CourseDetails {
  courseTitle: string;
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  paymentStatus: string;
  created_at: string;
}

const CoursePaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // In a real implementation, you would fetch course details using the session_id
    // For now, we'll show a generic success message
    if (sessionId) {
      // Simulate fetching data
      setCourseDetails({
        courseTitle: "Kursbokning genomförd",
        buyerName: "Deltagare",
        buyerEmail: "",
        totalAmount: 0,
        paymentStatus: "paid",
        created_at: new Date().toISOString()
      });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EBEBEB' }}>
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-success/20 backdrop-blur-sm" style={{ backgroundColor: '#F3F3F3' }}>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <h1 className="text-3xl text-foreground mb-2">
                  Tack för din kursbokning!
                </h1>
                <p className="text-muted-foreground">
                  Din betalning har genomförts och din plats är reserverad.
                </p>
              </div>

              <div className="bg-success/5 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-foreground mb-4">
                  Nästa steg
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Du kommer att få ett bekräftelsemail inom kort</li>
                  <li>Kursinformation och praktiska detaljer skickas senast en vecka före kursstart</li>
                  <li>Hör av dig till oss om du har några frågor</li>
                </ul>
              </div>

              {courseDetails && (
                <div className="bg-background/50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-foreground mb-3">Bokningsdetaljer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>Registrering genomförd</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Datum: {new Date(courseDetails.created_at).toLocaleDateString('sv-SE')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Status: Bekräftad</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/kurser">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tillbaka till kurser
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Hem</Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Har du frågor? Kontakta oss på{' '}
                  <a href="mailto:kontakt@improteatern.se" className="text-primary hover:underline">
                    kontakt@improteatern.se
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CoursePaymentSuccess;