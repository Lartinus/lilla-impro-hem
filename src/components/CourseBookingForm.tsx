
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  postal_code: string;
  city: string;
}

interface CourseBookingFormProps {
  courseTitle: string;
  isAvailable: boolean;
}

const CourseBookingForm = ({ courseTitle, isAvailable }: CourseBookingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<BookingFormData>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      postal_code: '',
      city: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('course_bookings')
        .insert({
          course_title: courseTitle,
          ...data,
        });

      if (error) {
        console.error('Error submitting booking:', error);
        toast({
          title: "Fel",
          description: "Det gick inte att skicka din bokning. Försök igen.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bokning skickad!",
        description: "Vi har tagit emot din kursbokning och kommer att kontakta dig snart.",
      });
      
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Fel",
        description: "Det gick inte att skicka din bokning. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonText = isAvailable ? 'Boka din plats' : 'Anmäl ditt intresse';
  const dialogTitle = isAvailable ? `Boka plats - ${courseTitle}` : `Anmäl intresse - ${courseTitle}`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`w-full ${
            isAvailable 
              ? 'bg-theatre-primary hover:bg-theatre-tertiary text-white' 
              : 'bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white'
          }`}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-theatre-primary">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Namn är obligatoriskt" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namn *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ditt fullständiga namn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              rules={{ required: "Telefonnummer är obligatoriskt" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonnummer *</FormLabel>
                  <FormControl>
                    <Input placeholder="070-123 45 67" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              rules={{ 
                required: "E-postadress är obligatorisk",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Ange en giltig e-postadress"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-postadress *</FormLabel>
                  <FormControl>
                    <Input placeholder="din@email.se" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              rules={{ required: "Adress är obligatorisk" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adress *</FormLabel>
                  <FormControl>
                    <Input placeholder="Gatuadress och nummer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                rules={{ required: "Postnummer är obligatoriskt" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postnummer *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 45" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                rules={{ required: "Ort är obligatorisk" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort *</FormLabel>
                    <FormControl>
                      <Input placeholder="Stockholm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Avbryt
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-theatre-primary hover:bg-theatre-tertiary"
              >
                {isSubmitting ? "Skickar..." : "Skicka bokning"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseBookingForm;
