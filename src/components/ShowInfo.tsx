
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
        {title} {formatDateTime(date)}
      </h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <MapPin size={16} className="text-red-800 mr-2" />
          <a 
            href={mapLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-content-secondary hover:underline"
          >
            {location}
          </a>
        </div>
      </div>
      
      <div 
        className="text-content-secondary mb-6 text-base body-text" 
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(description?.trim?.() ? description : "Mer info kommer snart.") }}
      />
    </>
  );
};

export default ShowInfo;
