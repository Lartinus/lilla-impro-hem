import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, X, User, Calendar, MapPin, Ticket, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ScanResultsProps {
  ticket: any;
  onBack: () => void;
  onUpdate: () => void;
}

export const ScanResults: React.FC<ScanResultsProps> = ({ ticket, onBack, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateScanStatus = async (scanned: boolean) => {
    try {
      setIsUpdating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Du måste vara inloggad');
        return;
      }

      const { data, error } = await supabase.rpc('update_ticket_scan_status', {
        ticket_id_param: ticket.id,
        scanned_param: scanned,
        admin_user_id_param: user.id
      });

      if (error) {
        console.error('Error updating scan status:', error);
        toast.error('Fel vid uppdatering av scanstatus');
        return;
      }

      if (!data) {
        toast.error('Kunde inte uppdatera biljetten');
        return;
      }

      toast.success(scanned ? 'Biljett markerad som scannad' : 'Scanning återställd');
      onUpdate();
      onBack();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ett oväntat fel inträffade');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: sv });
    } catch {
      return dateString;
    }
  };

  const totalTickets = ticket.regular_tickets + ticket.discount_tickets;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Biljettinformation</h2>
      </div>

      {ticket.scanned_status && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Denna biljett har redan scannats in {ticket.scanned_at && 
              `(${format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv })})`
            }
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          {/* Show Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-2">{ticket.show_title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(ticket.show_date)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {ticket.show_location}
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Köpare
            </h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{ticket.buyer_name}</p>
              <p className="text-muted-foreground">{ticket.buyer_email}</p>
            </div>
          </div>

          {/* Ticket Information */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Biljetter ({totalTickets} st)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {ticket.regular_tickets > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-lg font-bold">{ticket.regular_tickets}</div>
                  <div className="text-sm text-muted-foreground">Ordinarie</div>
                </div>
              )}
              {ticket.discount_tickets > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-lg font-bold">{ticket.discount_tickets}</div>
                  <div className="text-sm text-muted-foreground">Student</div>
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Totalt belopp:</span>
                <span className="font-semibold">{ticket.total_amount} kr</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Scan Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ticket.scanned_status ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="font-medium">
              {ticket.scanned_status ? 'Inscannad' : 'Ej scannad'}
            </span>
          </div>
          <Badge variant={ticket.scanned_status ? 'default' : 'secondary'}>
            {ticket.scanned_status ? 'Scannad' : 'Väntande'}
          </Badge>
        </div>
        
        {ticket.scanned_at && (
          <p className="text-sm text-muted-foreground mt-2">
            Scannad: {format(new Date(ticket.scanned_at), 'HH:mm dd MMMM yyyy', { locale: sv })}
          </p>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {!ticket.scanned_status ? (
          <Button 
            onClick={() => handleUpdateScanStatus(true)}
            disabled={isUpdating}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            {isUpdating ? 'Uppdaterar...' : 'Markera som scannad'}
          </Button>
        ) : (
          <Button 
            onClick={() => handleUpdateScanStatus(false)}
            disabled={isUpdating}
            variant="destructive"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            {isUpdating ? 'Uppdaterar...' : 'Ta bort scanning'}
          </Button>
        )}
        
        <Button variant="outline" onClick={onBack} className="w-full">
          Tillbaka till scanner
        </Button>
      </div>
    </div>
  );
};