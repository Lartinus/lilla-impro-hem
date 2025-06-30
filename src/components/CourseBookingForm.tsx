
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';
import { 
  useCourseInstances, 
  createCourseInstance, 
  getCurrentCourseBookings,
  checkDuplicateBooking,
  insertCourseBooking
} from '@/hooks/useCourseInstances';

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
  const [activeInstance, setActiveInstance] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: courseInstances, isLoading: isLoadingInstances } = useCourseInstances(courseTitle);
  
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

  // Set active instance when data loads
  useEffect(() => {
    if (courseInstances && courseInstances.length > 0) {
      setActiveInstance(courseInstances[0]);
    }
  }, [courseInstances]);

  // Use maxParticipants from instance if available, otherwise fall back to prop
  const effectiveMaxParticipants = activeInstance?.max_participants || maxParticipants;
  const isFull = effectiveMaxParticipants && currentBookings !== null && currentBookings >= effectiveMaxParticipants;

  // Enhanced dialog open handler with automatic course sync
  const handleDialogOpen = async (open: boolean) => {
    if (open) {
      setIsCheckingAvailability(true);
      try {
        // If no active instance exists, try to sync courses first
        if (!activeInstance && !isLoadingInstances) {
          console.log('No active instance found, attempting to sync courses...');
          
          // Call sync-courses function to ensure course tables exist
          try {
            const { error: syncError } = await supabase.functions.invoke('sync-courses');
            if (syncError) {
              console.error('Error syncing courses:', syncError);
            } else {
              console.log('Course sync completed, refetching instances...');
              // Wait a moment for the sync to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (syncError) {
            console.error('Error calling sync-courses function:', syncError);
          }

          // Re-fetch course instances after sync
          const { data: refreshedInstances } = await supabase
            .from('course_instances')
            .select('*')
            .eq('course_title', courseTitle)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

          if (refreshedInstances && refreshedInstances.length > 0) {
            setActiveInstance(refreshedInstances[0]);
            const count = await getCurrentCourseBookings(refreshedInstances[0].table_name);
            setCurrentBookings(count);
          } else {
            // If still no instance after sync, fall back to the utility function
            const { ensureCourseTableExists } = await import('@/utils/courseTableUtils');
            const newInstance = await ensureCourseTableExists(courseTitle);
            setActiveInstance(newInstance);
            setCurrentBookings(0);
          }
        } else if (activeInstance) {
          // Check current bookings for the active instance
          const count = await getCurrentCourseBookings(activeInstance.table_name);
          setCurrentBookings(count);
        }
      } catch (error) {
        console.error('Error handling course instance:', error);
        toast({
          title: "Problem med kursbokning",
          description: "Det gick inte att förbereda bokningen. Kursen kanske inte är tillgänglig för bokning än. Kontakta oss via info@improteatern.se om problemet kvarstår.",
          variant: "destructive",
        });
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
        toast({
          title: "Varning",
          description: "Bokningen lyckades men bekräftelsemail kunde inte skickas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
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

    if (!activeInstance) {
      toast({
        title: "Fel",
        description: "Ingen aktiv kursomgång hittades. Försök igen eller kontakta oss.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for duplicate booking
      const isDuplicate = await checkDuplicateBooking(data.email, activeInstance.table_name);
      if (isDuplicate) {
        toast({
          title: "Redan anmäld",
          description: "Den här e-postadressen är redan anmäld till denna kursomgång.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if course is full
      if (effectiveMaxParticipants) {
        const count = await getCurrentCourseBookings(activeInstance.table_name);
        if (count >= effectiveMaxParticipants) {
          toast({
            title: "Kursen är fullbokad",
            description: "Tyvärr är kursen nu fullbokad. Kontakta oss för att komma med på väntelistan.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const submitData = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        address: isAvailable ? (data.address?.trim() || '') : '',
        postal_code: isAvailable ? (data.postal_code?.trim() || '') : '',
        city: isAvailable ? (data.city?.trim() || '') : '',
        message: !isAvailable ? (data.message?.trim() || '') : '',
      };

      await insertCourseBooking(activeInstance.table_name, submitData);
      await sendConfirmationEmail(data);

      toast({
        title: isAvailable ? "Bokning skickad!" : "Intresse anmält!",
        description: isAvailable 
          ? "Vi har tagit emot din kursbokning och skickat en bekräftelse via e-post."
          : "Vi har tagit emot din intresseanmälan och skickat en bekräftelse via e-post.",
      });
      
      form.reset();
      setIsOpen(false);

      if (effectiveMaxParticipants) {
        setCurrentBookings(prev => prev !== null ? prev + 1 : 1);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Fel vid bokning",
        description: "Det gick inte att skicka din bokning. Kontakta oss direkt via info@improteatern.se eller försök igen senare.",
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

  const dialogTitle = isAvailable ? `Boka plats - ${courseTitle}` : `Anmäl intresse - ${courseTitle}`;

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
            disabled={buttonDisabled || isLoadingInstances}
          >
            {(isCheckingAvailability || isLoadingInstances) ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Kontrollerar...</span>
              </div>
            ) : displayButtonText}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-theatre-primary">{dialogTitle}</DialogTitle>
          </DialogHeader>

          {effectiveMaxParticipants && (
            <div className="mb-4 text-sm text-gray-500">
              {currentBookings !== null && effectiveMaxParticipants !== null ? (
                <span>
                  {effectiveMaxParticipants - currentBookings} av {effectiveMaxParticipants} platser kvar
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader className="h-3 w-3 animate-spin" />
                  <span>Kontrollerar tillgänglighet...</span>
                </div>
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
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Skickar...</span>
                    </div>
                  ) : (isAvailable ? "Skicka bokning" : "Skicka intresse")}
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
