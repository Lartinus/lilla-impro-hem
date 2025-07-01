
interface PracticalInfoProps {
  practicalInfo: string[];
}

const PracticalInfo = ({ practicalInfo }: PracticalInfoProps) => {
  if (!practicalInfo || practicalInfo.length === 0) return null;
  
  return (
    <div className="mb-6">
      <p className="text-base text-gray-800 font-bold mb-1">Praktisk information</p>
      <div className="space-y-2">
        {practicalInfo.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-color-primary rounded-full flex-shrink-0 mt-2"></div>
            <p className="text-gray-700 text-base">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticalInfo;
