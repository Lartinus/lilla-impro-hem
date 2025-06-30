
import { useState } from 'react';
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
  buttonVariant?: "default" | "outline";
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
  const { data: courseInstances, isLoading: instancesLoading } = useCourseInstances(courseTitle);

  // Lazy course table creation - only when user tries to book
  const ensureCourseTable = async () => {
    console.log('Ensuring course table exists for:', courseTitle);
    
    // Check if we already have an active instance
    if (courseInstances && courseInstances.length > 0) {
      console.log('Course instance already exists:', courseInstances[0]);
      return courseInstances[0];
    }

    // Create new instance and table
    try {
      const { data, error } = await supabase.functions.invoke('sync-courses');
      
      if (error) {
        console.error('Error in sync-courses:', error);
        throw new Error('Fel vid kurssynkronisering');
      }
      
      console.log('Sync result:', data);
      
      // Refresh instances after sync
      return null; // Will be handled by refetch
    } catch (error) {
      console.error('Failed to ensure course table:', error);
      throw error;
    }
  };

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
      // Ensure course table exists (lazy creation)
      const courseInstance = await ensureCourseTable();
      
      if (!courseInstance && courseInstances && courseInstances.length === 0) {
        throw new Error('Kunde inte skapa kurstabell');
      }
      
      const tableName = courseInstance?.table_name || courseInstances?.[0]?.table_name;
      
      if (!tableName) {
        throw new Error('Ingen kurstabell hittades');
      }

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
      await insertCourseBooking(tableName, formData);

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-course-confirmation', {
        body: {
          ...formData,
          course_title: courseTitle,
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
