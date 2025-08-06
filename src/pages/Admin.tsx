import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Settings, LogIn, LogOut, Menu, Home } from 'lucide-react';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { CourseTemplateManagement } from '@/components/admin/CourseTemplateManagement';
import ShowTemplateManagement from '@/components/admin/ShowTemplateManagement';
import { TicketManagement } from '@/components/admin/TicketManagement';
import { PerformerManagement } from '@/components/admin/PerformerManagement';
import { InterestSignupManagement } from '@/components/admin/InterestSignupManagement';
import ShowManagement from '@/components/admin/ShowManagement';
import { VenueManagement } from '@/components/admin/VenueManagement';
import { ActorManagement } from '@/components/admin/ActorManagement';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DiscountCodeManagement } from '@/components/admin/DiscountCodeManagement';
import { ImageManagement } from '@/components/admin/ImageManagement';
import { StripeSettingsManagement } from '@/components/admin/StripeSettingsManagement';
import EmailManagement from '@/components/admin/EmailManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminShowsOverview } from '@/components/admin/AdminShowsOverview';
import { AdminCoursesOverview } from '@/components/admin/AdminCoursesOverview';
import { AdminEconomyOverview } from '@/components/admin/AdminEconomyOverview';

const AdminDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('overview');
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
      <div className="min-h-screen flex items-center justify-center font-satoshi bg-background-gray">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background-gray font-satoshi">
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

  // Show access denied if not admin or superadmin
  if (!['admin', 'superadmin'].includes(userRole || '')) {
    return (
      <div className="min-h-screen bg-background-gray font-satoshi">
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
      case 'stripe':
        return <StripeSettingsManagement />;
      case 'email-send':
        return <EmailManagement activeTab="send" />;
      case 'email-templates':
        return <EmailManagement activeTab="templates" />;
      case 'email-groups':
        return <EmailManagement activeTab="groups" />;
      case 'email-contacts':
        return <EmailManagement activeTab="contacts" />;
      case 'email-automatic':
        return <EmailManagement activeTab="automatic" />;
      case 'email-sent':
        return <EmailManagement activeTab="sent" />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background-gray font-satoshi [&_*]:!font-satoshi">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          expandedSections={expandedSections}
          setExpandedSections={setExpandedSections}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-50 h-16 flex items-center justify-between bg-card-background px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <SidebarTrigger className="md:hidden shrink-0" />
              <Badge variant="secondary" className="text-xs flex items-center font-satoshi hidden">
                <Settings className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <h2 className="pt-3 font-bold text-base lg:text-lg">Lilla Improteatern</h2>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <Button 
                asChild
                variant="outline" 
                size="sm" 
                className="text-xs flex items-center font-satoshi"
              >
                <Link to="/">
                  <Home className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Startsida</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-xs flex items-center font-satoshi"
              >
                <LogOut className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Logga ut</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
            <div className="max-w-full">
              {activeSection === 'overview' ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-satoshi font-bold text-text-gray mb-6">Översikt</h2>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4 md:p-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                          <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi">
                              {statsLoading ? '--' : stats?.avgCourseParticipants || 0}
                            </div>
                            <p className="text-xs md:text-sm font-medium font-satoshi">Genomsnitt antal kursdeltagare</p>
                          </div>

                          <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi">
                              {statsLoading ? '--' : stats?.avgSoldTicketsPerShow || 0}
                            </div>
                            <p className="text-xs md:text-sm font-medium font-satoshi">Genomsnitt antal sålda biljetter</p>
                          </div>

                          <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi">
                              {statsLoading ? '--' : stats?.activeCourses || 0}
                            </div>
                            <p className="text-xs md:text-sm font-medium font-satoshi">Aktiva kurser</p>
                          </div>

                          <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi">
                              {statsLoading ? '--' : (stats?.nextShowDate ? new Date(stats.nextShowDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) : '--')}
                            </div>
                            <p className="text-xs md:text-sm font-medium font-satoshi">Nästa föreställning</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Shows and Courses Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AdminShowsOverview />
                    <AdminCoursesOverview />
                  </div>

                  {/* Economy Overview - Full Width */}
                  <AdminEconomyOverview />
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden">
                  {renderContent()}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
