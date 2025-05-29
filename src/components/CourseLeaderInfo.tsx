
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
  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Kursledare</h4>
      <div className="bg-theatre-light/10 rounded-none border border-transparent p-4">
        <div className="flex items-start space-x-4 mb-4">
          <img 
            src={courseLeader.image} 
            alt={courseLeader.name}
            className="w-20 h-20 rounded-full object-cover object-top flex-shrink-0"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-700 block mb-3">
              {courseLeader.name}
            </span>
            <p className="text-gray-700 leading-relaxed text-sm">
              {courseLeader.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLeaderInfo;
