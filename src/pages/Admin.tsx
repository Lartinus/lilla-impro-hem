import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Ticket, Mail, Settings, LogIn, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { TicketManagement } from '@/components/admin/TicketManagement';
import { PerformerManagement } from '@/components/admin/PerformerManagement';
import { InterestSignupManagement } from '@/components/admin/InterestSignupManagement';
import { ShowManagement } from '@/components/admin/ShowManagement';
import { VenueManagement } from '@/components/admin/VenueManagement';
import { ActorManagement } from '@/components/admin/ActorManagement';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('overview');
  const [expandedSections, setExpandedSections] = React.useState({
    courses: false,
    shows: false
  });

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-10">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {showSignUp ? 'Skapa adminkonto' : 'Administratörsinloggning'}
                </CardTitle>
                <CardDescription>
                  {showSignUp 
                    ? 'Registrera dig för att få tillgång till administratörspanelen'
                    : 'Logga in för att komma åt administratörspanelen'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showSignUp ? <SignUpForm /> : <LoginForm />}
                
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSignUp(!showSignUp)}
                    className="text-sm"
                  >
                    {showSignUp 
                      ? 'Har du redan ett konto? Logga in'
                      : 'Inget konto? Registrera dig'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show access denied if not admin
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-10">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-destructive">Åtkomst nekad</CardTitle>
                <CardDescription>
                  Du har inte behörighet att komma åt denna sida.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Administratörspanel</h1>
              <p className="text-muted-foreground mt-2">Hantera kurser, biljetter och kommunikation</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Settings className="w-4 h-4 mr-1" />
              Admin
            </Badge>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totala Kursanmälningar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '--' : stats?.totalCourseBookings || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? 'Läses in...' : 'Totalt antal anmälningar'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sålda Biljetter</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '--' : stats?.soldTickets || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? 'Läses in...' : 'Antal sålda biljetter'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktiva Kurser</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '--' : stats?.activeCourses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? 'Läses in...' : 'Antal aktiva kurser'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skickade Email</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Kommande funktion</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {/* Översikt */}
                  <div>
                    <Button
                      variant={activeSection === 'overview' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveSection('overview')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Översikt
                    </Button>
                  </div>

                  {/* Kurser Section */}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => setExpandedSections(prev => ({
                        ...prev,
                        courses: !prev.courses
                      }))}
                    >
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Kurser
                      </span>
                      {expandedSections.courses ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    {expandedSections.courses && (
                      <div className="ml-6 space-y-1">
                        <Button
                          variant={activeSection === 'courses' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('courses')}
                        >
                          Kurshantering
                        </Button>
                        <Button
                          variant={activeSection === 'interest' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('interest')}
                        >
                          Intresse
                        </Button>
                        <Button
                          variant={activeSection === 'performers' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('performers')}
                        >
                          Kursledare
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Föreställningar Section */}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => setExpandedSections(prev => ({
                        ...prev,
                        shows: !prev.shows
                      }))}
                    >
                      <span className="flex items-center">
                        <Ticket className="w-4 h-4 mr-2" />
                        Föreställningar
                      </span>
                      {expandedSections.shows ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    {expandedSections.shows && (
                      <div className="ml-6 space-y-1">
                        <Button
                          variant={activeSection === 'shows' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('shows')}
                        >
                          Föreställningar
                        </Button>
                        <Button
                          variant={activeSection === 'actors' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('actors')}
                        >
                          Skådespelare
                        </Button>
                        <Button
                          variant={activeSection === 'discount-codes' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('discount-codes')}
                        >
                          Rabattkoder
                        </Button>
                        <Button
                          variant={activeSection === 'venues' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('venues')}
                        >
                          Platser
                        </Button>
                        <Button
                          variant={activeSection === 'tickets' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveSection('tickets')}
                        >
                          Biljetter
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email Section */}
                  <div>
                    <Button
                      variant={activeSection === 'email' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveSection('email')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Översikt</CardTitle>
                  <CardDescription>
                    Snabb överblick över systemets status och aktivitet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Dashboard kommer snart</h3>
                    <p className="text-muted-foreground">
                      Detaljerad statistik och grafer kommer att implementeras här
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'courses' && <CourseManagement />}
            {activeSection === 'performers' && <PerformerManagement />}
            {activeSection === 'interest' && <InterestSignupManagement />}
            {activeSection === 'shows' && <ShowManagement />}
            {activeSection === 'actors' && <ActorManagement />}
            {activeSection === 'venues' && <VenueManagement />}
            {activeSection === 'tickets' && <TicketManagement />}
            
            {activeSection === 'discount-codes' && (
              <div className="text-center py-12">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Rabattkoder kommer snart</h3>
                <p className="text-muted-foreground">
                  Funktionalitet för att hantera rabattkoder kommer att implementeras här
                </p>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email-hantering kommer snart</h3>
                <p className="text-muted-foreground">
                  Funktionalitet för att hantera emails kommer att implementeras här
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;