
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface PracticalInfoProps {
  practicalInfo: string[];
}

const PracticalInfo = ({ practicalInfo }: PracticalInfoProps) => {
  // Format each item as a proper markdown list item
  const formatAsMarkdownList = (items: string[]) => {
    return items
      .filter(item => item.trim()) // Remove empty items
      .map(item => {
        const trimmed = item.trim();
        // If it doesn't start with -, add it
        return trimmed.startsWith('-') ? trimmed : `- ${trimmed}`;
      })
      .join('\n');
  };

  const markdownList = formatAsMarkdownList(practicalInfo);
  
  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Praktisk information</h4>
      <div 
        className="text-gray-700 text-base body-text" 
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(markdownList) }}
      />
    </div>
  );
};

export default PracticalInfo;
