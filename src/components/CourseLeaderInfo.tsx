
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CourseLeader {
  id: number;
  name: string;
  image: string;
  bio: string;
}

interface CourseLeaderInfoProps {
  courseLeader: CourseLeader;
}

const CourseLeaderInfo = ({ courseLeader }: CourseLeaderInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Kursledare</h4>
      <div className="bg-theatre-light/10 rounded-none border border-transparent">
        <div 
          className="flex items-center justify-between space-x-4 p-4 cursor-pointer hover:bg-theatre-light/20 transition-all duration-300 hover:border-theatre-secondary hover:shadow-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <img 
              src={courseLeader.image} 
              alt={courseLeader.name}
              className="w-16 h-16 rounded-full object-cover object-top"
            />
            <span className="font-medium text-gray-700 hover:text-theatre-secondary transition-colors duration-300">
              {courseLeader.name}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700 leading-relaxed">
                {courseLeader.bio}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLeaderInfo;
