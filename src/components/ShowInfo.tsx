
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
      <style>
        {`
          .location-text-override {
            font-size: 10px !important;
            font-family: 'Satoshi', sans-serif !important;
            font-weight: 400 !important;
            line-height: 1.2 !important;
            color: var(--content-secondary) !important;
            display: inline-block !important;
            text-decoration: none !important;
            text-transform: none !important;
            letter-spacing: normal !important;
            max-width: 100% !important;
            word-break: break-word !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .location-text-override * {
            font-size: 10px !important;
            font-family: 'Satoshi', sans-serif !important;
            font-weight: 400 !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .location-text-override:hover {
            text-decoration: underline !important;
          }
        `}
      </style>
      <h2 className="mb-4">
        {title} {formatDateTime(date)}
      </h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <MapPin size={16} className="text-red-800 mr-2" />
          <h3>
            <a 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline location-text-override"
            >
              {location}
            </a>
          </h3>
        </div>
      </div>
      
      <div 
        className="text-content-secondary mb-6 text-base body-text" 
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(description) }}
      />
    </>
  );
};

export default ShowInfo;
