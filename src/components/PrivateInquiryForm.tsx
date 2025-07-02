
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PrivateInquiryForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occasion: '',
    requirements: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.requirements) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Vänligen fyll i alla obligatoriska fält (märkta med *).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-inquiry', {
        body: {
          type: 'private',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          occasion: formData.occasion,
          requirements: formData.requirements
        }
      });

      if (error) {
        console.error('Error sending inquiry:', error);
        throw new Error(error.message || 'Ett fel uppstod när förfrågan skulle skickas');
      }

      toast({
        title: "Förfrågan skickad!",
        description: "Vi har tagit emot din förfrågan och kommer att kontakta dig så snart som möjligt.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        occasion: '',
        requirements: ''
      });
      setIsFormOpen(false);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte skicka förfrågan. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isFormOpen) {
    return (
      <Button 
        onClick={() => setIsFormOpen(true)}
        className="px-8 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
      >
        Gör en förfrågan
      </Button>
    );
  }

  return (
    <div className="border-4 border-blue-500 p-6 bg-gray-50 rounded-none">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Namn *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white disabled:opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-postadress *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white disabled:opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefonnummer
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white disabled:opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-1">
            Tillfälle
          </label>
          <input
            type="text"
            id="occasion"
            name="occasion"
            value={formData.occasion}
            onChange={handleInputChange}
            disabled={isSubmitting}
            placeholder="T.ex. Möhippa, födelsedagsfest, svensexa"
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder:text-gray-500 text-sm sm:text-base disabled:opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Vad är ni ute efter? *
          </label>
          <textarea
            id="requirements"
            name="requirements"
            required
            rows={4}
            value={formData.requirements}
            onChange={handleInputChange}
            disabled={isSubmitting}
            placeholder="Beskriv era behov och mål för aktiviteten"
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] max-h-[300px] text-black bg-white placeholder:text-gray-500 text-sm sm:text-base disabled:opacity-50"
          />
        </div>
        
        <div className="flex space-x-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Skickar...' : 'Skicka förfrågan'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsFormOpen(false)}
            disabled={isSubmitting}
            className="px-6 py-2 border-gray-400 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Avbryt
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PrivateInquiryForm;
