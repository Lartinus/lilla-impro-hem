
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  address?: string;
  postal_code?: string;
  city?: string;
  message?: string;
}

interface CourseBookingFormProps {
  courseTitle: string;
  isAvailable: boolean;
  showButton: boolean;
  buttonText?: string;
  buttonVariant?: "default" | "outline";
  maxParticipants?: number | null;
}

const CourseBookingForm = ({ 
  courseTitle, 
  isAvailable, 
  showButton, 
  buttonText = "Boka din plats",
  buttonVariant = "default",
  maxParticipants
}: CourseBookingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBookings, setCurrentBookings] = useState<number | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<BookingFormData>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      postal_code: '',
      city: '',
      message: '',
    },
  });

  // Check if course is full
  const isFull = maxParticipants && currentBookings !== null && currentBookings >= maxParticipants;

  // Check current bookings when dialog opens
  const handleDialogOpen = async (open: boolean) => {
    if (open && maxParticipants) {
      setIsCheckingAvailability(true);
      try {
        const { count, error } = await supabase
          .from('course_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('course_title', courseTitle);

        if (error) {
          console.error('Error checking course availability:', error);
        } else {
          setCurrentBookings(count || 0);
        }
      } catch (error) {
        console.error('Error checking course availability:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    }
    setIsOpen(open);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+46|0)[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  };

  const checkDuplicateBooking = async (email: string) => {
    const { data, error } = await supabase
      .from('course_bookings')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('course_title', courseTitle)
      .limit(1);

    if (error) {
      console.error('Error checking duplicate booking:', error);
      return false;
    }

    return data && data.length > 0;
  };

  const sendConfirmationEmail = async (data: BookingFormData) => {
    try {
      const { error } = await supabase.functions.invoke('send-course-confirmation', {
        body: {
          name: data.name,
          email: data.email,
          courseTitle: courseTitle,
          isAvailable: isAvailable,
        },
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw error - booking should still succeed even if email fails
        toast({
          title: "Varning",
          description: "Bokningen lyckades men bekräftelsemail kunde inte skickas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error - booking should still succeed even if email fails
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    // Enhanced validation
    if (!validateEmail(data.email)) {
      toast({
        title: "Fel",
        description: "Ange en giltig e-postadress.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(data.phone)) {
      toast({
        title: "Fel",
        description: "Ange ett giltigt telefonnummer (svenskt format).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for duplicate booking
      const isDuplicate = await checkDuplicateBooking(data.email);
      if (isDuplicate) {
        toast({
          title: "Redan anmäld",
          description: "Den här e-postadressen är redan anmäld till kursen.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if course is full before submitting
      if (maxParticipants) {
        const { count, error } = await supabase
          .from('course_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('course_title', courseTitle);

        if (error) {
          throw error;
        }

        if (count && count >= maxParticipants) {
          toast({
            title: "Kursen är fullbokad",
            description: "Tyvärr är kursen nu fullbokad. Försök anmäla intresse istället.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const submitData = {
        course_title: courseTitle,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        address: isAvailable ? (data.address?.trim() || '') : '',
        postal_code: isAvailable ? (data.postal_code?.trim() || '') : '',
        city: isAvailable ? (data.city?.trim() || '') : '',
        message: !isAvailable ? (data.message?.trim() || '') : '',
      };

      const { error } = await supabase
        .from('course_bookings')
        .insert(submitData);

      if (error) {
        console.error('Error submitting booking:', error);
        
        // Check if it's a duplicate constraint error
        if (error.code === '23505' && error.message.includes('unique_email_per_course')) {
          toast({
            title: "Redan anmäld",
            description: "Du är redan anmäld till den här kursen.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Fel",
            description: "Det gick inte att skicka din bokning. Försök igen.",
            variant: "destructive",
          });
        }
        return;
      }

      // Send confirmation email
      await sendConfirmationEmail(data);

      toast({
        title: isAvailable ? "Bokning skickad!" : "Intresse anmält!",
        description: isAvailable 
          ? "Vi har tagit emot din kursbokning och skickat en bekräftelse via e-post."
          : "Vi har tagit emot din intresseanmälan och skickat en bekräftelse via e-post.",
      });
      
      form.reset();
      setIsOpen(false);

      // Update current bookings count
      if (maxParticipants) {
        setCurrentBookings(prev => prev !== null ? prev + 1 : 1);
      }
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

  if (!showButton) {
    return null;
  }

  // Determine button text and availability
  let displayButtonText = buttonText;
  let buttonDisabled = false;

  if (isFull) {
    displayButtonText = "Fullbokad!";
    buttonDisabled = true;
  } else if (!displayButtonText) {
    displayButtonText = isAvailable ? 'Boka din plats' : 'Anmäl ditt intresse';
  }

  const dialogTitle = isAvailable ? `Boka plats - ${courseTitle}` : `Anmäl intresse - ${course
Title}`;

  return (
    <div className="mt-auto">
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="w-full" 
            variant={buttonVariant === "outline" ? "outline" : "default"}
            style={buttonVariant === "outline" ? { 
              backgroundColor: '#3B82F6', 
              color: 'white',
              borderColor: '#3B82F6'
            } : undefined}
            disabled={buttonDisabled}
          >
            {isCheckingAvailability ? "Kontrollerar..." : displayButtonText}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-theatre-primary">{dialogTitle}</DialogTitle>
          </DialogHeader>

          {maxParticipants && (
            <div className="mb-4 text-sm text-gray-500">
              {currentBookings !== null && maxParticipants !== null ? (
                <span>
                  {maxParticipants - currentBookings} av {maxParticipants} platser kvar
                </span>
              ) : (
                <span>Kontrollerar tillgänglighet...</span>
              )}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ 
                  required: "Namn är obligatoriskt",
                  minLength: { value: 2, message: "Namnet måste vara minst 2 tecken" }
                }}
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
                rules={{ 
                  required: "Telefonnummer är obligatoriskt",
                  validate: (value) => validatePhone(value) || "Ange ett giltigt svenskt telefonnummer"
                }}
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
                  validate: (value) => validateEmail(value) || "Ange en giltig e-postadress"
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
              
              {isAvailable ? (
                // Original booking form fields for available courses
                <>
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
                </>
              ) : (
                // Interest form with free text field
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Om dig som improvisatör</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Här kan du skriva en kort text om dig som improvisatör och hur du vill utvecklas"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
                  className="flex-1"
                >
                  {isSubmitting ? "Skickar..." : (isAvailable ? "Skicka bokning" : "Skicka intresse")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseBookingForm;
