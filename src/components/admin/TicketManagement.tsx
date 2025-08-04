import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShowTicketOverview } from './ticket/ShowTicketOverview';

export const TicketManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Biljetthantering</h1>
        <p className="text-muted-foreground">Hantera biljettförsäljning för aktiva och genomförda föreställningar</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active">Aktiva föreställningar</TabsTrigger>
          <TabsTrigger value="completed">Genomförda föreställningar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <ShowTicketOverview showCompleted={false} />
        </TabsContent>
        
        <TabsContent value="completed">
          <ShowTicketOverview showCompleted={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};