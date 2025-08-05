import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/components/auth/AuthProvider';
import { QRScanner } from '@/components/scanning/QRScanner';
import { ScanResults } from '@/components/scanning/ScanResults';
import { TicketList } from '@/components/scanning/TicketList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthModal from '@/components/auth/AuthModal';
import { Camera, List, Scan, LogOut, User } from 'lucide-react';

export const TicketScanning = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState<'scanner' | 'list'>('scanner');
  const [scannedTicket, setScannedTicket] = useState<any>(null);

  // Redirect if not mobile/tablet
  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Endast för mobila enheter</h1>
          <p className="text-muted-foreground">
            Biljettscanningen är endast tillgänglig på mobil och tablet för att kunna använda kameran.
          </p>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Scan className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Biljettscanning</h1>
          <p className="text-muted-foreground mb-6">
            Du måste vara inloggad för att komma åt biljettscanningen.
          </p>
          <AuthModal onSuccess={() => window.location.reload()}>
            <Button size="lg" className="w-full">
              Logga in
            </Button>
          </AuthModal>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has required role (admin or staff)
  if (userRole !== 'admin' && userRole !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Ingen behörighet</h1>
          <p className="text-muted-foreground mb-4">
            Du har inte behörighet att komma åt biljettscanningen. Kontakta en administratör för att få 'staff' eller 'admin' behörighet.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Inloggad som: {user.email}
            </p>
            <Button variant="outline" onClick={() => signOut()} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleScanSuccess = (ticket: any) => {
    setScannedTicket(ticket);
    setActiveTab('scanner'); // Stay on scanner tab to show results
  };

  const handleBackToScanner = () => {
    setScannedTicket(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container pt-24 mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Scan className="h-7 w-7" />
                Biljettscanning
              </h1>
              <p className="text-muted-foreground">
                Scanna QR-koder eller markera manuellt i listan
              </p>
            </div>
            
            <div className="flex flex-col items-end space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {userRole === 'admin' ? 'Admin' : 'Staff'}
                </Badge>
                <span>•</span>
                <span>{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="text-xs">
                <LogOut className="h-3 w-3 mr-1" />
                Logga ut
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scanner' | 'list')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-4">
            {scannedTicket ? (
              <ScanResults 
                ticket={scannedTicket} 
                onBack={handleBackToScanner}
                onUpdate={() => {
                  // Refresh the ticket list data
                  window.location.reload();
                }}
              />
            ) : (
              <QRScanner onScanSuccess={handleScanSuccess} />
            )}
          </TabsContent>

          <TabsContent value="list">
            <TicketList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};