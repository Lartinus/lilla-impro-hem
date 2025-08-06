import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const StripeSettingsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingMode, setPendingMode] = useState<string | null>(null);

  const { data: stripeMode, isLoading } = useQuery({
    queryKey: ["stripe-mode"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "stripe_mode")
        .single();
      
      if (error) throw error;
      return data.value;
    },
  });

  const updateStripeModeMutation = useMutation({
    mutationFn: async (newMode: string) => {
      const { error } = await supabase
        .from("settings")
        .update({ value: newMode })
        .eq("key", "stripe_mode");
      
      if (error) throw error;
    },
    onSuccess: (_, newMode) => {
      queryClient.invalidateQueries({ queryKey: ["stripe-mode"] });
      toast({
        title: "Stripe-läge uppdaterat",
        description: `Växlade till ${newMode === 'live' ? 'live' : 'test'}-läge`,
      });
      setPendingMode(null);
    },
    onError: (error) => {
      console.error("Error updating Stripe mode:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera Stripe-läge",
        variant: "destructive",
      });
      setPendingMode(null);
    },
  });

  const handleModeChange = (isLive: boolean) => {
    const newMode = isLive ? "live" : "test";
    setPendingMode(newMode);
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      updateStripeModeMutation.mutate(pendingMode);
    }
  };

  const isLiveMode = stripeMode === "live";
  const isTestMode = stripeMode === "test";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe-inställningar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Laddar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Stripe-inställningar
        </CardTitle>
        <CardDescription>
          Hantera Stripe-betalningsläge (test vs live)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Label htmlFor="stripe-mode" className="text-base font-medium">
              Betalningsläge
            </Label>
            <div className="flex items-center gap-2">
              {isTestMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  TESTLÄGE
                </Badge>
              )}
              {isLiveMode && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  LIVELÄGE
                </Badge>
              )}
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex items-center space-x-2">
                <Label htmlFor="stripe-mode">Test</Label>
                <Switch
                  id="stripe-mode"
                  checked={isLiveMode}
                  onCheckedChange={handleModeChange}
                  disabled={updateStripeModeMutation.isPending}
                />
                <Label htmlFor="stripe-mode">Live</Label>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Bekräfta Stripe-lägesändring
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingMode === "live" ? (
                    <>
                      <strong>Du växlar till LIVELÄGE.</strong>
                      <br />
                      Detta innebär att riktiga betalningar kommer att behandlas och riktiga pengar kommer att debiteras från kunder.
                      Se till att du har testat betalningsflödet ordentligt i testläge först.
                    </>
                  ) : (
                    <>
                      <strong>Du växlar till TESTLÄGE.</strong>
                      <br />
                      Inga riktiga betalningar kommer att behandlas. Använd detta läge för att testa ditt betalningsflöde.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPendingMode(null)}>
                  Avbryt
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmModeChange}>
                  {pendingMode === "live" ? "Växla till Liveläge" : "Växla till Testläge"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isLiveMode && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Liveläge aktivt</p>
                <p className="text-sm text-yellow-700">
                  Riktiga betalningar behandlas. Se till att alla inställningar är korrekta.
                </p>
              </div>
            </div>
          </div>
        )}

        {isTestMode && (
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Testläge aktivt</p>
                <p className="text-sm text-blue-700">
                  Använd testbetalningsmetoder. Inga riktiga betalningar kommer att behandlas.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};