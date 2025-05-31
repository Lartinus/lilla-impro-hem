
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
  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Kursledare</h4>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
          {courseLeader.image ? (
            <img 
              src={courseLeader.image} 
              alt={courseLeader.name}
              className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0 md:mx-0"
              onError={(e) => {
                console.error('Failed to load teacher image:', courseLeader.image);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-300 rounded-none flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 text-sm">Ingen bild</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-gray-800 mb-2 md:text-left">
              {courseLeader.name}
            </h5>
            <p className="text-gray-700 leading-relaxed text-sm break-words">
              {courseLeader.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLeaderInfo;
