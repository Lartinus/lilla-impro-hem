
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCourseInstances, checkDuplicateBooking, insertCourseBooking } from '@/hooks/useCourseInstances';
import { Loader2 } from 'lucide-react';

interface CourseBookingFormProps {
  courseTitle: string;
  isAvailable: boolean;
  showButton: boolean;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "blue";
  maxParticipants?: number | null;
}

const CourseBookingForm = ({ 
  courseTitle, 
  isAvailable, 
  showButton, 
  buttonText = "Boka plats",
  buttonVariant = "default",
  maxParticipants 
}: CourseBookingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    postal_code: '',
    city: '',
    message: ''
  });

  const { toast } = useToast();
  const { data: courseInstances, isLoading: instancesLoading, refetch } = useCourseInstances(courseTitle);

  // Improved function to ensure course table exists
  const ensureCourseTableExists = useCallback(async () => {
    console.log('Ensuring course table exists for:', courseTitle);
    
    // First check if we already have an active instance
    if (courseInstances && courseInstances.length > 0) {
      console.log('Using existing course instance:', courseInstances[0]);
      return courseInstances[0];
    }

    try {
      // Use the sync-courses function to create the instance and table
      console.log('Creating new course instance via sync-courses...');
      const { data, error } = await supabase.functions.invoke('sync-courses');
      
      if (error) {
        console.error('Error in sync-courses:', error);
        throw new Error('Fel vid kurssynkronisering');
      }
      
      console.log('Sync result:', data);
      
      // Refetch course instances to get the newly created one
      const { data: refreshedInstances } = await refetch();
      
      if (refreshedInstances && refreshedInstances.length > 0) {
        console.log('Found newly created instance:', refreshedInstances[0]);
        return refreshedInstances[0];
      } else {
        throw new Error('Ingen kurstabell kunde skapas');
      }
      
    } catch (error) {
      console.error('Failed to ensure course table:', error);
      throw error;
    }
  }, [courseTitle, courseInstances, refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Saknade uppgifter",
        description: "Vänligen fyll i alla obligatoriska fält.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting booking process...');
      
      // Ensure course table exists and get the instance
      const courseInstance = await ensureCourseTableExists();
      
      if (!courseInstance || !courseInstance.table_name) {
        throw new Error('Kunde inte få tillgång till kurstabell');
      }

      const tableName = courseInstance.table_name;
      console.log('Using table:', tableName);

      // Check for duplicate booking
      const isDuplicate = await checkDuplicateBooking(formData.email, tableName);
      
      if (isDuplicate) {
        toast({
          title: "Bokning finns redan",
          description: "Du har redan bokat denna kurs med denna e-postadress.",
          variant: "destructive",
        });
        return;
      }

      // Insert booking
      console.log('Inserting booking...');
      await insertCourseBooking(tableName, formData);

      // Send confirmation email
      console.log('Sending confirmation email...');
      const { error: emailError } = await supabase.functions.invoke('send-course-confirmation', {
        body: {
          ...formData,
          course_title: courseTitle,
          isAvailable: isAvailable,
        }
      });

      if (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      toast({
        title: isAvailable ? "Bokning bekräftad!" : "Intresseanmälan registrerad!",
        description: isAvailable 
          ? "Din plats är nu bokad. Du kommer att få en bekräftelse via e-post." 
          : "Vi har registrerat ditt intresse och hör av oss när kursen blir tillgänglig.",
      });
      
      setIsOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        postal_code: '',
        city: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Fel vid bokning",
        description: "Det gick inte att skicka din bokning. Kontakta oss direkt via info@improteatern.se eller försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!showButton) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant}
          className="w-full mt-4"
          disabled={instancesLoading}
        >
          {instancesLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Laddar...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAvailable ? `Boka plats - ${courseTitle}` : `Anmäl intresse - ${courseTitle}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Namn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Adress</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="postal_code">Postnummer</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Meddelande</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAvailable ? 'Bokar...' : 'Skickar...'}
                </>
              ) : (
                isAvailable ? 'Bekräfta bokning' : 'Skicka intresseanmälan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseBookingForm;
