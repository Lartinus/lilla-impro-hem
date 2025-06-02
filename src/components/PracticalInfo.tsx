
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface PracticalInfoProps {
  practicalInfo: string[];
}

const PracticalInfo = ({ practicalInfo }: PracticalInfoProps) => {
  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Praktisk information</h4>
      <div className="space-y-2">
        {practicalInfo.map((item: string, index: number) => (
          <div key={index} className="flex items-start space-x-3">
            <div 
              className="bullet-point bg-blue-500 rounded-full flex-shrink-0"
              style={{ width: 'var(--bullet-size)', height: 'var(--bullet-size)', marginTop: '0.375rem' }}
            ></div>
            <div 
              className="text-gray-700 text-base body-text flex-1" 
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(item) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticalInfo;
