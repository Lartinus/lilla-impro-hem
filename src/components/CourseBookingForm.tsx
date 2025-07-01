

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ensureCourseTableExists } from '@/utils/courseTableUtils';

interface CourseBookingFormProps {
  courseTitle: string;
  isAvailable: boolean;
  showButton: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'blue';
  maxParticipants?: number | null;
}

const formSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(6, 'Telefonnummer måste vara minst 6 tecken'),
  address: z.string().min(1, 'Adress är obligatorisk'),
  postalCode: z.string().min(1, 'Postnummer är obligatoriskt'),
  city: z.string().min(1, 'Stad är obligatorisk'),
});

const houseTeamsSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(6, 'Telefonnummer måste vara minst 6 tecken'),
  message: z.string().optional(),
});

const CourseBookingForm = ({ 
  courseTitle, 
  isAvailable, 
  showButton, 
  buttonText = 'Anmäl dig',
  buttonVariant = 'default',
  maxParticipants 
}: CourseBookingFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check if this is a House Teams or fortsättning course
  const isHouseTeamsOrContinuation = courseTitle.includes("House teams") || courseTitle.includes("fortsättning");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
    },
  });

  const houseTeamsForm = useForm<z.infer<typeof houseTeamsSchema>>({
    resolver: zodResolver(houseTeamsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema> | z.infer<typeof houseTeamsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Ensure the course instance exists and get the table name
      const courseInstance = await ensureCourseTableExists(courseTitle);
      console.log('Course instance:', courseInstance);
      
      // Use the RPC function to insert the booking
      const { error } = await supabase.rpc('insert_course_booking', {
        table_name: courseInstance.table_name,
        booking_name: values.name,
        booking_phone: values.phone,
        booking_email: values.email,
        booking_address: 'address' in values ? values.address || '' : '',
        booking_postal_code: 'postalCode' in values ? values.postalCode || '' : '',
        booking_city: 'city' in values ? values.city || '' : '',
        booking_message: 'message' in values ? values.message || '' : ''
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Anmälan skickad!",
        description: "Vi återkommer till dig så snart som möjligt.",
      });

      if (isHouseTeamsOrContinuation) {
        houseTeamsForm.reset();
      } else {
        form.reset();
      }
      setOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Något gick fel",
        description: "Försök igen eller kontakta oss direkt.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showButton) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="w-full">
          {isHouseTeamsOrContinuation ? buttonText : 'Boka din plats'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none">
        <DialogHeader>
          <DialogTitle>
            {isHouseTeamsOrContinuation ? "Anmäl intresse - House Teams & fortsättning" : `Anmäl dig till ${courseTitle}`}
          </DialogTitle>
        </DialogHeader>

        {isHouseTeamsOrContinuation ? (
          <Form {...houseTeamsForm}>
            <form onSubmit={houseTeamsForm.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={houseTeamsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Namn *</FormLabel>
                    <FormControl>
                      <Input placeholder="För- och efternamn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={houseTeamsForm.control}
                name="phone"
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
                control={houseTeamsForm.control}
                name="email"
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
                control={houseTeamsForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Om dig som improvisatör</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Här kan du skriva en kort text om dig som improvisatör och hur du vill utvecklas"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Skickar...' : 'Skicka intresseanmälan'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Namn *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ditt fullständiga namn" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-postadress *</FormLabel>
                    <FormControl>
                      <Input placeholder="din@email.se" type="email" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer *</FormLabel>
                    <FormControl>
                      <Input placeholder="070-123 45 67" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adress *</FormLabel>
                    <FormControl>
                      <Input placeholder="Gatuadress" className="rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postnummer *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" className="rounded-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Stockholm" className="rounded-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-4">
                <p>• Anmälan är bindande</p>
                <p>• Betalning sker via faktura som mejlas till e-postadressen du anger ovan</p>
                <p>• Avbokning är kostnadsfri fram till 30 dagar före kursstart. Därefter debiteras 50 % av kursavgiften. Vid avbokning senare än 14 dagar före kursstart debiteras hela avgiften</p>
                <p>• Vid utebliven närvaro sker ingen återbetalning</p>
                <p>• Bekräftelse på din plats skickas via mejl inom 5 arbetsdagar efter att anmälan har registrerats</p>
                <p>• För frågor eller särskilda önskemål, kontakta oss på kurs@improteatern.se</p>
              </div>

              {maxParticipants && (
                <div className="text-sm text-muted-foreground">
                  Max {maxParticipants} deltagare
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Skickar...' : 'Boka din plats'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseBookingForm;

