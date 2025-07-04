import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Ticket, Mail, Settings, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { TicketManagement } from '@/components/admin/TicketManagement';
import { PerformerManagement } from '@/components/admin/PerformerManagement';
import { InterestSignupManagement } from '@/components/admin/InterestSignupManagement';
import { ShowManagement } from '@/components/admin/ShowManagement';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [showSignUp, setShowSignUp] = React.useState(false);

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

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="courses">Kurser</TabsTrigger>
            <TabsTrigger value="shows">Föreställningar</TabsTrigger>
            <TabsTrigger value="interest">Intresseanmälan</TabsTrigger>
            <TabsTrigger value="performers">Kursledare</TabsTrigger>
            <TabsTrigger value="tickets">Biljetter</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="shows">
            <ShowManagement />
          </TabsContent>

          <TabsContent value="interest">
            <InterestSignupManagement />
          </TabsContent>

          <TabsContent value="performers">
            <PerformerManagement />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManagement />
          </TabsContent>

          <TabsContent value="email">
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email-hantering kommer snart</h3>
              <p className="text-muted-foreground">
                Funktionalitet för att hantera emails kommer att implementeras här
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;