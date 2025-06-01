
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface CourseLeader {
  id: number;
  name: string;
  image: string | null;
  bio: string;
}

interface CourseLeaderInfoProps {
  courseLeader: CourseLeader;
}

const CourseLeaderInfo = ({ courseLeader }: CourseLeaderInfoProps) => {
  console.log('CourseLeaderInfo - courseLeader:', courseLeader);
  console.log('CourseLeaderInfo - image URL:', courseLeader.image);
  console.log('CourseLeaderInfo - image type:', typeof courseLeader.image);
  console.log('CourseLeaderInfo - full image object:', JSON.stringify(courseLeader.image, null, 2));

  // Check if we have a valid image URL
  const hasValidImage = courseLeader.image && 
                       courseLeader.image !== 'null' && 
                       courseLeader.image.trim() !== '' &&
                       courseLeader.image !== 'undefined';

  console.log('CourseLeaderInfo - hasValidImage:', hasValidImage);

  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Kursledare</h4>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
          {hasValidImage ? (
            <img 
              src={courseLeader.image} 
              alt={courseLeader.name}
              className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0 md:mx-0"
              onError={(e) => {
                console.error('Failed to load teacher image:', courseLeader.image);
                console.error('Image error event:', e);
                console.error('Image error details:', e.currentTarget.src);
                const target = e.currentTarget;
                target.style.display = 'none';
                // Show fallback div
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
              onLoad={() => {
                console.log('Successfully loaded teacher image:', courseLeader.image);
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
            <h5 className="font-bold text-gray-800 teacher-name md:text-left mb-0">
              {courseLeader.name}
            </h5>
            <div 
              className="text-gray-700 text-sm break-words body-text teacher-bio [&>p]:mb-1 [&>p]:mt-0 [&>h1]:mb-0.5 [&>h2]:mb-0.5 [&>h3]:mb-0.5 [&>h4]:mb-0.5 [&>h5]:mb-0.5 [&>h6]:mb-0.5 [&>*:first-child]:mt-0"
              style={{ 
                marginTop: 'var(--name-to-bio-spacing)',
                paddingTop: '0',
                lineHeight: 'var(--body-line-height)'
              }}
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(courseLeader.bio) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLeaderInfo;
