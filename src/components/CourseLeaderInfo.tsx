// src/components/CourseLeaderInfo.tsx
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import OptimizedImage from './OptimizedImage';

interface CourseLeader {
  id: number;
  name: string;
  image: string | null;
  bio: string;
}

interface CourseLeaderInfoProps {
  courseLeaders: CourseLeader[];
}

export default function CourseLeaderInfo({ courseLeaders }: CourseLeaderInfoProps) {
  return (
    <div className="mb-6 mt-6">
      <h2 className="mb-2">Kursledare</h2>
      <div className="course-outline-red rounded-none p-4">
        <div className="space-y-6">
          {courseLeaders.map((courseLeader, index) => (
            <div key={courseLeader.id} className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-4">
              <OptimizedImage
                src={courseLeader.image}
                alt={courseLeader.name}
                className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0 lg:mx-0"
                fallbackText="Ingen bild"
                preferredSize="small"
              />
              <div className="flex-1 min-w-0 -mb-4">
                <p className="font-bold text-sm mb-1">{courseLeader.name}</p>
                <div
                  className="leading-relaxed break-words [&>p]:text-[14px] 4md:[&>p]:text-[14px]"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(courseLeader.bio) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
