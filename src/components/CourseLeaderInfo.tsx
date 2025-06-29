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
  courseLeader: CourseLeader;
}

export default function CourseLeaderInfo({ courseLeader }: CourseLeaderInfoProps) {
  return (
    <div className="mb-6">
      <h4 className="mb-2">Kursledare</h4>
      <div className="rounded-none border-3 border-red-800 p-4">
        <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-4">
          
          <OptimizedImage
            src={courseLeader.image}
            alt={courseLeader.name}
            className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0 lg:mx-0"
            fallbackText="Ingen bild"
            preferredSize="small"
          />

          <div className="flex-1 min-w-0">
            <h6 className="teacher-name mb-2">{courseLeader.name}</h6>
            <div
              className="text-base md:text-[12px] leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(courseLeader.bio) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
