import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import OptimizedImage from './OptimizedImage';

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

  return (
    <div className="mb-6">
      <h4 className="mb-2">Kursledare</h4>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-4">
          <OptimizedImage
            src={courseLeader.image}
            alt={courseLeader.name}
            className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0 lg:mx-0"
            fallbackText="Ingen bild"
            preferredSize="small"
          />
          
          <div className="flex-1 min-w-0">
            <h6 className="teacher-name mb-0">{courseLeader.name}</h6>
            <div
              className={`
                body-text teacher-bio break-words 
                text-base lg:text-[12px]
                [&>p]:mb-1 [&>p]:mt-0 
                [&>h1]:mb-0.5 [&>h2]:mb-0.5 [&>h3]:mb-0.5 
                [&>h4]:mb-0.5 [&>h5]:mb-0.5 [&>h6]:mb-0.5 
                [&>*:first-child]:mt-0
              `}
              style={{
                marginTop: 'var(--name-to-bio-spacing)',
                paddingTop:  '0',
                lineHeight: 'var(--body-line-height)',
              }}
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(courseLeader.bio),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLeaderInfo;
