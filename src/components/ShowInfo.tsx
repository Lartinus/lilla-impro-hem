
import { MapPin } from 'lucide-react';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface ShowInfoProps {
  title: string;
  date: string;
  location: string;
  mapLink: string;
  description: string;
}

const ShowInfo = ({ title, date, location, mapLink, description }: ShowInfoProps) => {
  const formatDateTime = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('sv-SE', { month: 'long' });
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
      
      return `${day} ${month} ${timeStr}`;
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <h2 className="mb-4">
        <span className="block md:hidden">{title}</span>
        <span className="hidden md:block">{title} {formatDateTime(date)}</span>
      </h2>
      <div className="block md:hidden text-blue-500 font-bold text-lg mb-4">{formatDateTime(date)}</div>
      
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <MapPin size={16} className="text-red-800 mr-2" />
          <h3 className="text-red-800 font-medium">
            <a 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {location}
            </a>
          </h3>
        </div>
      </div>
      
      <div 
        className="text-gray-700 mb-6 text-base body-text" 
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(description) }}
      />
    </>
  );
};

export default ShowInfo;
