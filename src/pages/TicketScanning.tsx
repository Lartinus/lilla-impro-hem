import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { QRScanner } from '@/components/scanning/QRScanner';
import { ScanResults } from '@/components/scanning/ScanResults';
import { TicketList } from '@/components/scanning/TicketList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Camera, List, Scan } from 'lucide-react';

export const TicketScanning = () => {
  const isMobile = useIsMobile();
  const { data: userRole, isLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState<'scanner' | 'list'>('scanner');
  const [scannedTicket, setScannedTicket] = useState<any>(null);

  // Redirect if not mobile/tablet or not admin
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
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
      <div className="container mt-6 mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scan className="h-8 w-8" />
            Biljettscanning
          </h1>
          <p className="text-muted-foreground">
            Scanna QR-koder eller markera manuellt i listan
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scanner' | 'list')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
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