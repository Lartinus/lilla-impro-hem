import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Users, UserCheck, UserX, Shield, ShieldCheck, Mail, Calendar } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
  role?: 'admin' | 'staff' | 'user' | null;
}

export const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'remove' | 'kick'>('approve');
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data.users || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Approve user as admin
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Administratör godkänd",
        description: "Användaren har nu administratörsbehörighet.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte godkänna administratör: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Remove admin role
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Administratörsbehörighet borttagen",
        description: "Användaren är inte längre administratör.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte ta bort administratörsbehörighet: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Kick user (delete from auth.users)
  const kickUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'delete-user', userId }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Användare utkastad",
        description: "Användaren har tagits bort från systemet.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte kasta ut användare: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleAction = (user: User, action: 'approve' | 'remove' | 'kick') => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!selectedUser) return;

    switch (actionType) {
      case 'approve':
        approveMutation.mutate(selectedUser.id);
        break;
      case 'remove':
        removeAdminMutation.mutate(selectedUser.id);
        break;
      case 'kick':
        kickUserMutation.mutate(selectedUser.id);
        break;
    }
  };

  const getRoleBadge = (role: string | null | undefined) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'staff':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><ShieldCheck className="w-3 h-3 mr-1" />Personal</Badge>;
      default:
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Användare</Badge>;
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case 'approve':
        return 'godkänna som administratör';
      case 'remove':
        return 'ta bort administratörsbehörighet för';
      case 'kick':
        return 'kasta ut';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingUsers = users?.filter(user => !user.role) || [];
  const adminUsers = users?.filter(user => user.role === 'admin') || [];
  const regularUsers = users?.filter(user => user.role && user.role !== 'admin') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Användarhantering</h2>
        <p className="text-muted-foreground">Hantera användarroller och behörigheter</p>
      </div>

      {/* Pending Admin Approvals */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Väntar på godkännande ({pendingUsers.length})
            </CardTitle>
            <CardDescription>
              Nya användare som väntar på att bli godkända som administratörer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Registrerad: {new Date(user.created_at).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {getRoleBadge(user.role)}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => handleAction(user, 'approve')}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Godkänn som admin
                      </Button>
                      <Button
                        onClick={() => handleAction(user, 'kick')}
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Kasta ut
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Administrators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Administratörer ({adminUsers.length})
          </CardTitle>
          <CardDescription>
            Användare med administratörsbehörighet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminUsers.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Registrerad: {new Date(user.created_at).toLocaleDateString('sv-SE')}
                      {user.email_confirmed_at && (
                        <span className="ml-2">• Bekräftad: {new Date(user.email_confirmed_at).toLocaleDateString('sv-SE')}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {getRoleBadge(user.role)}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => handleAction(user, 'remove')}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Ta bort admin
                    </Button>
                    <Button
                      onClick={() => handleAction(user, 'kick')}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Kasta ut
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regular Users */}
      {regularUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Övriga användare ({regularUsers.length})
            </CardTitle>
            <CardDescription>
              Användare med standard behörigheter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regularUsers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Registrerad: {new Date(user.created_at).toLocaleDateString('sv-SE')}
                        {user.email_confirmed_at && (
                          <span className="ml-2">• Bekräftad: {new Date(user.email_confirmed_at).toLocaleDateString('sv-SE')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    {getRoleBadge(user.role)}
                    <Button
                      onClick={() => handleAction(user, 'kick')}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Kasta ut
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bekräfta åtgärd</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill {getActionText()} <strong>{selectedUser?.email}</strong>?
              {actionType === 'kick' && (
                <span className="block mt-2 text-destructive font-medium">
                  Detta kommer att permanent ta bort användaren från systemet.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className={actionType === 'kick' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionType === 'approve' && 'Godkänn'}
              {actionType === 'remove' && 'Ta bort behörighet'}
              {actionType === 'kick' && 'Kasta ut'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};