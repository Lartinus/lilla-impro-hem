
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const CorporateInquiryForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    occasion: '',
    requirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:info@lillaimproteatern.se?subject=Företagsförfrågan från ${formData.company}&body=Namn: ${formData.name}%0D%0AE-post: ${formData.email}%0D%0ATelefon: ${formData.phone}%0D%0AFöretag: ${formData.company}%0D%0ATillfälle: ${formData.occasion}%0D%0AVad ni är ute efter: ${formData.requirements}`;
    
    window.location.href = mailtoLink;
    setIsFormOpen(false);
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
        className="px-8 py-3 text-sm font-medium bg-accent-color-primary hover:bg-accent-color-hover text-theatre-text-primary"
      >
        Gör en förfrågan
      </Button>
    );
  }

  return (
    <div className="border-4 border-accent-color-primary p-6 bg-surface-secondary rounded-none">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-content-secondary mb-1">
            Namn *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-color-primary rounded-none focus:outline-none focus:ring-2 focus:ring-accent-color-primary text-content-primary bg-surface-primary"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-content-secondary mb-1">
            E-postadress *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-color-primary rounded-none focus:outline-none focus:ring-2 focus:ring-accent-color-primary text-content-primary bg-surface-primary"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-content-secondary mb-1">
            Telefonnummer
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-color-primary rounded-none focus:outline-none focus:ring-2 focus:ring-accent-color-primary text-content-primary bg-surface-primary"
          />
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-content-secondary mb-1">
            Företag *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-color-primary rounded-none focus:outline-none focus:ring-2 focus:ring-accent-color-primary text-content-primary bg-surface-primary"
          />
        </div>
        
        <div>
          <label htmlFor="occasion" className="block text-sm font-medium text-content-secondary mb-1">
            Tillfälle
          </label>
          <input
            type="text"
            id="occasion"
            name="occasion"
            value={formData.occasion}
            onChange={handleInputChange}
            placeholder="T.ex. kickoff, teambuilding, konferens"
            className="w-full px-3 py-2 border border-color-primary rounded-none focus:outline-none focus:ring-2 focus:ring-accent-color-primary text-content-primary bg-surface-primary placeholder:text-content-muted text-sm sm:text-base"
          />
        </div>
        
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-content-secondary mb-1">
            Vad är ni ute efter? *
          </label>
          <textarea
            id="requirements"
            name="requirements"
            required
            rows={4}
            value={formData.requirements}
            onChange={handleInputChange}
            placeholder="Beskriv era behov och mål för aktiviteten"
            className="w-full px-3 py-2 border border-color-primary rounded-none focus:outline-none focus:ring-2 focus:ring-accent-color-primary resize-y min-h-[100px] max-h-[300px] text-content-primary bg-surface-primary placeholder:text-content-muted text-sm sm:text-base"
          />
        </div>
        
        <div className="flex space-x-3">
          <Button type="submit" className="px-6 py-2 bg-accent-color-primary hover:bg-accent-color-hover text-theatre-text-primary">
            Skicka förfrågan
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsFormOpen(false)}
            className="px-6 py-2 border-color-secondary text-content-secondary hover:bg-surface-secondary"
          >
            Avbryt
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CorporateInquiryForm;
