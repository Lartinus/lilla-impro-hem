
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';

interface Performer {
  id: number;
  name: string;
  image?: any; // More flexible type to handle different image structures
  bio: string;
  bild?: any; // Alternative Swedish field name
}

interface PerformersSectionProps {
  performers: Performer[];
}

const PerformersSection = ({ performers }: PerformersSectionProps) => {
  console.log('PerformersSection - performers:', performers);

  if (!performers || performers.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Medverkande</h4>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="space-y-6">
          {performers.map((performer) => {
            // Use image data directly as processed in About.tsx
            const imageData = performer.image || performer.bild;
            const imageUrl = getStrapiImageUrl(imageData);
            const hasValidImage = imageUrl && 
                                imageUrl !== 'null' && 
                                imageUrl.trim() !== '' &&
                                imageUrl !== 'undefined';
            
            console.log('PerformersSection - performer:', performer.name, 'imageData:', imageData, 'imageUrl:', imageUrl, 'hasValidImage:', hasValidImage);
            
            return (
              <div key={performer.id} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                {hasValidImage ? (
                  <img 
                    src={imageUrl} 
                    alt={performer.name}
                    className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                    onError={(e) => {
                      console.error('Failed to load performer image:', imageUrl);
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      // Show fallback div
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                    onLoad={() => {
                      console.log('Successfully loaded performer image:', imageUrl);
                    }}
                  />
                ) : null}
                
                {/* Fallback div - always present but hidden by default */}
                <div 
                  className="w-32 h-32 bg-gray-300 rounded-none flex items-center justify-center flex-shrink-0"
                  style={{ display: hasValidImage ? 'none' : 'flex' }}
                >
                  <span className="text-gray-600 text-sm">Ingen bild</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-gray-800 performer-name mb-0">
                    {performer.name}
                  </h5>
                  <div 
                    className="text-gray-700 text-sm break-words performer-bio [&>p]:mb-1 [&>p]:mt-0 [&>h1]:mb-0.5 [&>h2]:mb-0.5 [&>h3]:mb-0.5 [&>h4]:mb-0.5 [&>h5]:mb-0.5 [&>h6]:mb-0.5 [&>*:first-child]:mt-0"
                    style={{ 
                      marginTop: 'var(--name-to-bio-spacing)',
                      paddingTop: '0',
                      lineHeight: 'var(--body-line-height)'
                    }}
                    dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(performer.bio) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformersSection;
