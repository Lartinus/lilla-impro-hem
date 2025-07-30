import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface DiscountCode {
  id: string;
  code: string;
  discount_amount: number;
  discount_type: 'fixed' | 'percentage';
  max_uses?: number;
  current_uses: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

interface NewDiscountCodeForm {
  code: string;
  discount_amount: number;
  discount_type: 'fixed' | 'percentage';
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
}

export const DiscountCodeManagement = () => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  
  const [newCode, setNewCode] = useState<NewDiscountCodeForm>({
    code: '',
    discount_amount: 50,
    discount_type: 'fixed',
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch discount codes
  const { data: discountCodes, isLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(code => ({
        ...code,
        discount_type: code.discount_type as 'fixed' | 'percentage'
      })) as DiscountCode[];
    }
  });

  // Create discount code mutation
  const createCodeMutation = useMutation({
    mutationFn: async (codeData: NewDiscountCodeForm) => {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert([codeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      setIsDialogOpen(false);
      setNewCode({
        code: '',
        discount_amount: 50,
        discount_type: 'fixed',
        is_active: true
      });
      toast({
        title: "Rabattkod skapad",
        description: "Den nya rabattkoden har lagts till.",
      });
    }
  });

  // Update discount code mutation
  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DiscountCode> }) => {
      const { error } = await supabase
        .from('discount_codes')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingCode(null);
      toast({
        title: "Rabattkod uppdaterad",
        description: "Ändringarna har sparats.",
      });
    }
  });

  // Delete discount code mutation
  const deleteCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({
        title: "Rabattkod raderad",
        description: "Rabattkoden har tagits bort.",
      });
    }
  });

  const handleEditCode = (code: DiscountCode) => {
    setEditingCode(code);
    setNewCode({
      code: code.code,
      discount_amount: code.discount_amount,
      discount_type: code.discount_type,
      max_uses: code.max_uses || undefined,
      valid_from: code.valid_from || undefined,
      valid_until: code.valid_until || undefined,
      is_active: code.is_active
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (code: DiscountCode) => {
    updateCodeMutation.mutate({
      id: code.id,
      data: { is_active: !code.is_active }
    });
  };

  const handleDeleteCode = (code: DiscountCode) => {
    if (confirm(`Är du säker på att du vill radera rabattkoden "${code.code}"? Detta kan inte ångras.`)) {
      deleteCodeMutation.mutate(code.id);
    }
  };

  const handleSubmit = () => {
    if (isEditMode && editingCode) {
      updateCodeMutation.mutate({
        id: editingCode.id,
        data: newCode
      });
    } else {
      createCodeMutation.mutate(newCode);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rabattkoder</h2>
        <p className="text-muted-foreground">
          Hantera rabattkoder för föreställningar
        </p>
      </div>
      <div className="flex justify-start items-center">
        <Button onClick={() => {
          setIsEditMode(false);
          setEditingCode(null);
          setNewCode({
            code: '',
            discount_amount: 50,
            discount_type: 'fixed',
            is_active: true
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Lägg till rabattkod
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Laddar rabattkoder...</div>
      ) : discountCodes && discountCodes.length > 0 ? (
        isMobile ? (
          <div className="space-y-4">
            {discountCodes.map((code) => (
              <Card key={code.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono font-semibold bg-muted px-2 py-1 rounded text-sm">
                        {code.code}
                      </code>
                      <Badge variant={code.is_active ? "default" : "secondary"}>
                        {code.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Användningar: {code.current_uses}/{code.max_uses || '∞'}</div>
                      <div>
                        Giltig till: {code.valid_until 
                          ? format(new Date(code.valid_until), 'yyyy-MM-dd')
                          : 'Ingen gräns'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {code.discount_type === 'percentage' 
                        ? `${code.discount_amount}%` 
                        : `${code.discount_amount}kr`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">rabatt</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCode(code)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Redigera
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleActive(code)}
                  >
                    {code.is_active ? 'Inaktivera' : 'Aktivera'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteCode(code)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Radera
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Rabatt</TableHead>
                <TableHead>Använd/Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Giltig till</TableHead>
                <TableHead>Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                  <TableCell>
                    {code.discount_type === 'percentage' 
                      ? `${code.discount_amount}%` 
                      : `${code.discount_amount}kr`
                    }
                  </TableCell>
                  <TableCell>
                    {code.current_uses}/{code.max_uses || '∞'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={code.is_active ? "default" : "secondary"}>
                      {code.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {code.valid_until 
                      ? format(new Date(code.valid_until), 'yyyy-MM-dd')
                      : 'Ingen gräns'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCode(code)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Redigera
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleActive(code)}
                      >
                        {code.is_active ? 'Inaktivera' : 'Aktivera'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCode(code)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Radera
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      ) : (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga rabattkoder</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Skapa rabattkoder för att erbjuda specialpriser.
          </p>
        </div>
      )}

      {/* Discount Code Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setIsEditMode(false);
          setEditingCode(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Redigera rabattkod' : 'Lägg till rabattkod'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Kod</Label>
              <Input
                id="code"
                value={newCode.code}
                onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="RABATT50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_amount">Rabattbelopp</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  value={newCode.discount_amount}
                  onChange={(e) => setNewCode(prev => ({ ...prev, discount_amount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="discount_type">Typ</Label>
                <Select
                  value={newCode.discount_type}
                  onValueChange={(value) => setNewCode(prev => ({ ...prev, discount_type: value as 'fixed' | 'percentage' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fast belopp (kr)</SelectItem>
                    <SelectItem value="percentage">Procent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="max_uses">Max användningar (lämna tomt för obegränsat)</Label>
              <Input
                id="max_uses"
                type="number"
                value={newCode.max_uses || ''}
                onChange={(e) => setNewCode(prev => ({ 
                  ...prev, 
                  max_uses: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Giltig från</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={newCode.valid_from || ''}
                  onChange={(e) => setNewCode(prev => ({ 
                    ...prev, 
                    valid_from: e.target.value || undefined 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="valid_until">Giltig till</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={newCode.valid_until || ''}
                  onChange={(e) => setNewCode(prev => ({ 
                    ...prev, 
                    valid_until: e.target.value || undefined 
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="code_is_active"
                checked={newCode.is_active}
                onCheckedChange={(checked) => setNewCode(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="code_is_active">Aktiv rabattkod</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCodeMutation.isPending || updateCodeMutation.isPending}
              >
                {createCodeMutation.isPending || updateCodeMutation.isPending 
                  ? 'Sparar...' 
                  : (isEditMode ? 'Uppdatera' : 'Skapa')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};