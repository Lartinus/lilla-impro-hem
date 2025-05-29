
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
        <div className="flex items-start space-x-4">
          <img 
            src={courseLeader.image} 
            alt={courseLeader.name}
            className="w-20 h-20 rounded-none object-cover object-top flex-shrink-0"
          />
          <div className="flex-1">
            <h5 className="font-bold text-gray-800 mb-2">
              {courseLeader.name}
            </h5>
            <p className="text-gray-700 leading-relaxed text-sm text-left">
              {courseLeader.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLeaderInfo;
