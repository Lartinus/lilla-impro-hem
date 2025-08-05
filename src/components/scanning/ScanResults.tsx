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

type ScanningStep = 'initial' | 'partial-input' | 'completed';

export const ScanResults: React.FC<ScanResultsProps> = ({ ticket, onBack, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [scanningStep, setScanningStep] = useState<ScanningStep>('initial');
  const [partialTicketCount, setPartialTicketCount] = useState(1);

  const handlePartialScan = async (ticketCount: number) => {
    try {
      setIsUpdating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Du måste vara inloggad');
        return;
      }

      const { data, error } = await supabase.rpc('update_partial_ticket_scan', {
        ticket_id_param: ticket.id,
        scanned_tickets_param: ticketCount,
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

      const remainingTickets = totalTickets - (ticket.scanned_tickets || 0) - ticketCount;
      if (remainingTickets > 0) {
        toast.success(`${ticketCount} av ${totalTickets} personer scannade in`);
      } else {
        toast.success('Alla personer har kommit!');
      }
      
      onUpdate();
      onBack();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ett oväntat fel inträffade');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetScan = async () => {
    try {
      setIsUpdating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Du måste vara inloggad');
        return;
      }

      const { error } = await supabase
        .from('ticket_purchases')
        .update({
          scanned_tickets: 0,
          scanned_status: false,
          partial_scan: false,
          scanned_at: null,
          scanned_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) {
        console.error('Error resetting scan:', error);
        toast.error('Fel vid återställning av scanning');
        return;
      }

      toast.success('Scanning återställd');
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
  const scannedTickets = ticket.scanned_tickets || 0;
  const remainingTickets = totalTickets - scannedTickets;
  const isPartiallyScanned = ticket.partial_scan || false;
  const isFullyScanned = ticket.scanned_status || false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Biljettinformation</h2>
      </div>

      {isPartiallyScanned && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {scannedTickets} av {totalTickets} personer har kommit 
            {ticket.scanned_at && 
              ` (senast ${format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv })})`
            }
          </AlertDescription>
        </Alert>
      )}

      {isFullyScanned && !isPartiallyScanned && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            Alla {totalTickets} personer har kommit
            {ticket.scanned_at && 
              ` (${format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv })})`
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
            <div className={`w-3 h-3 rounded-full ${
              isFullyScanned ? 'bg-green-500' : 
              isPartiallyScanned ? 'bg-yellow-500' : 'bg-gray-300'
            }`} />
            <span className="font-medium">
              {scannedTickets} av {totalTickets} personer
            </span>
          </div>
          <Badge variant={
            isFullyScanned ? 'default' : 
            isPartiallyScanned ? 'secondary' : 'outline'
          }>
            {isFullyScanned ? 'Alla här' : 
             isPartiallyScanned ? 'Delvis här' : 'Ingen här'}
          </Badge>
        </div>
        
        {ticket.scanned_at && (
          <p className="text-sm text-muted-foreground mt-2">
            Senast uppdaterad: {format(new Date(ticket.scanned_at), 'HH:mm dd MMMM yyyy', { locale: sv })}
          </p>
        )}
      </Card>

      {/* Scanning Actions */}
      {scanningStep === 'initial' && !isFullyScanned && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Har alla kommit?</h3>
            <p className="text-muted-foreground">
              {totalTickets} {totalTickets === 1 ? 'person' : 'personer'} köpte biljetter
              {isPartiallyScanned && `, ${remainingTickets} ${remainingTickets === 1 ? 'person' : 'personer'} kvar`}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handlePartialScan(remainingTickets)}
                disabled={isUpdating}
                size="lg"
                className="h-16"
              >
                <Check className="h-5 w-5 mr-2" />
                {isUpdating ? 'Scannar...' : 'Ja, alla är här'}
              </Button>
              <Button 
                onClick={() => {
                  setScanningStep('partial-input');
                  setPartialTicketCount(Math.min(remainingTickets, 1));
                }}
                variant="outline"
                size="lg"
                className="h-16"
              >
                <User className="h-5 w-5 mr-2" />
                Nej, bara några
              </Button>
            </div>
          </div>
        </Card>
      )}

      {scanningStep === 'partial-input' && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              Hur många kom just nu?
            </h3>
            <div className="text-center text-muted-foreground">
              {remainingTickets} {remainingTickets === 1 ? 'person' : 'personer'} kvar att scanna
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartialTicketCount(Math.max(1, partialTicketCount - 1))}
                disabled={partialTicketCount <= 1}
              >
                -
              </Button>
              <div className="text-2xl font-bold min-w-[3rem] text-center">
                {partialTicketCount}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartialTicketCount(Math.min(remainingTickets, partialTicketCount + 1))}
                disabled={partialTicketCount >= remainingTickets}
              >
                +
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handlePartialScan(partialTicketCount)}
                disabled={isUpdating}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                {isUpdating ? 'Scannar...' : 'Scanna in'}
              </Button>
              <Button
                onClick={() => setScanningStep('initial')}
                variant="outline"
                className="w-full"
              >
                Tillbaka
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Admin Actions */}
      {(isPartiallyScanned || isFullyScanned) && (
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleResetScan}
            disabled={isUpdating}
            variant="destructive"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            {isUpdating ? 'Återställer...' : 'Återställ scanning'}
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full">
            Tillbaka till scanner
          </Button>
        </div>
      )}

      {!isPartiallyScanned && !isFullyScanned && scanningStep === 'initial' && (
        <Button variant="outline" onClick={onBack} className="w-full">
          Tillbaka till scanner
        </Button>
      )}
    </div>
  );
};