

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
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
          <img 
            src={courseLeader.image} 
            alt={courseLeader.name}
            className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0 mx-auto md:mx-0"
          />
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-gray-800 mb-2 text-center md:text-left">
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
