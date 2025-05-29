import { Card, CardContent } from '@/components/ui/card';
import CourseBookingForm from '@/components/CourseBookingForm';
import CourseLeaderInfo from '@/components/CourseLeaderInfo';

interface CourseLeader {
  id: number;
  name: string;
  image: string;
  bio: string;
}

interface Course {
  title: string;
  subtitle: string;
  description: string;
  courseLeader: CourseLeader | null;
  available: boolean;
  showButton: boolean;
}

interface CourseCardProps {
  course: Course;
  practicalInfo: string[];
}

const CourseCard = ({ course, practicalInfo }: CourseCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
      <CardContent className="p-6 md:p-4 lg:p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-theatre-primary mb-2">
            {course.title}
          </h2>
          <h3 className="text-theatre-secondary font-medium mb-1">
            {course.subtitle}
          </h3>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          {course.description}
        </p>
        
        {course.courseLeader && (
          <CourseLeaderInfo courseLeader={course.courseLeader} />
        )}
        
        <div className="flex-1"></div>
        
        {course.available && (
          <div className="mb-4">
            <h4 className="text-gray-800 font-bold mb-1">Praktisk information</h4>
            <div className="space-y-2">
              {practicalInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <CourseBookingForm 
          courseTitle={course.title}
          isAvailable={course.available}
          showButton={course.showButton}
        />
      </CardContent>
    </Card>
  );
};

export default CourseCard;
