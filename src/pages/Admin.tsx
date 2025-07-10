import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Ticket, Mail, Settings, LogIn, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { CourseTemplateManagement } from '@/components/admin/CourseTemplateManagement';
import ShowTemplateManagement from '@/components/admin/ShowTemplateManagement';
import { TicketManagement } from '@/components/admin/TicketManagement';
import { PerformerManagement } from '@/components/admin/PerformerManagement';
import { InterestSignupManagement } from '@/components/admin/InterestSignupManagement';
import { ShowManagement } from '@/components/admin/ShowManagement';
import { VenueManagement } from '@/components/admin/VenueManagement';
import { ActorManagement } from '@/components/admin/ActorManagement';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { DiscountCodeManagement } from '@/components/admin/DiscountCodeManagement';
import { ImageManagement } from '@/components/admin/ImageManagement';
import EmailManagement from '@/components/admin/EmailManagement';
import { UserManagement } from '@/components/admin/UserManagement';

const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('courses');
  const [expandedSections, setExpandedSections] = React.useState({
    courses: true,
    shows: false,
    email: false
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      // User will be redirected automatically by the AuthProvider
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-satoshi">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background font-satoshi">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-32">
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
      <div className="min-h-screen bg-background font-satoshi">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-32">
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

  const renderContent = () => {
    switch (activeSection) {
      case 'courses':
        return <CourseManagement showCompleted={false} />;
      case 'courses-completed':
        return <CourseManagement showCompleted={true} />;
      case 'course-templates':
        return <CourseTemplateManagement />;
      case 'show-templates':
        return <ShowTemplateManagement />;
      case 'performers':
        return <PerformerManagement />;
      case 'interest':
        return <InterestSignupManagement />;
      case 'shows':
        return <ShowManagement showCompleted={false} />;
      case 'shows-completed':
        return <ShowManagement showCompleted={true} />;
      case 'actors':
        return <ActorManagement />;
      case 'venues':
        return <VenueManagement />;
      case 'tickets':
        return <TicketManagement />;
      case 'discount-codes':
        return <DiscountCodeManagement />;
      case 'users':
        return <UserManagement />;
      case 'images':
        return <ImageManagement />;
      case 'send':
      case 'groups':
      case 'contacts':
      case 'templates':
        return <EmailManagement activeTab={activeSection} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background font-satoshi">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Administratörspanel</h1>
              <p className="text-muted-foreground mt-2">Hantera kurser, biljetter och kommunikation</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs lg:text-sm flex items-center">
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                Admin
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-xs lg:text-sm flex items-center whitespace-nowrap"
              >
                <LogOut className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                Logga ut
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Översikt</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {statsLoading ? '--' : stats?.avgCourseParticipants || 0}
                  </div>
                  <p className="text-sm font-medium">Genomsnitt antal kursdeltagare</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {statsLoading ? '--' : stats?.avgSoldTicketsPerShow || 0}
                  </div>
                  <p className="text-sm font-medium">Genomsnitt antal sålda biljetter</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {statsLoading ? '--' : stats?.activeCourses || 0}
                  </div>
                  <p className="text-sm font-medium">Aktiva kurser</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {statsLoading ? '--' : (stats?.nextShowDate ? new Date(stats.nextShowDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) : '--')}
                  </div>
                  <p className="text-sm font-medium">Nästa föreställning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <AdminNavigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            expandedSections={expandedSections}
            setExpandedSections={setExpandedSections}
          />
        </div>

        {/* Main Content */}
        <div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;