
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const PrivateInquiryForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occasion: '',
    requirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:info@lillaimproteatern.se?subject=Privat förfrågan från ${formData.name}&body=Namn: ${formData.name}%0D%0AE-post: ${formData.email}%0D%0ATelefon: ${formData.phone}%0D%0ATillfälle: ${formData.occasion}%0D%0AVad ni är ute efter: ${formData.requirements}`;
    
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
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
            placeholder="T.ex. Möhippa, födelsedagsfest, svensexa"
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder:text-gray-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black bg-white placeholder:text-gray-500"
          />
        </div>
        
        <div className="flex space-x-3">
          <Button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white">
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

export default PrivateInquiryForm;
