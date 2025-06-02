
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface PracticalInfoProps {
  practicalInfo: string[];
}

const PracticalInfo = ({ practicalInfo }: PracticalInfoProps) => {
  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Praktisk information</h4>
      <div 
        className="text-gray-700 text-base body-text" 
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(practicalInfo.join('\n')) }}
      />
    </div>
  );
};

export default PracticalInfo;
