
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
        className="px-8 py-3 text-sm font-medium"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Företag *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="T.ex. kickoff, teambuilding, konferens"
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="Beskriv era behov och mål för aktiviteten"
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        <div className="flex space-x-3">
          <Button type="submit" className="px-6 py-2">
            Skicka förfrågan
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsFormOpen(false)}
            className="px-6 py-2 border-gray-400 text-gray-700 hover:bg-gray-50"
          >
            Avbryt
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CorporateInquiryForm;
