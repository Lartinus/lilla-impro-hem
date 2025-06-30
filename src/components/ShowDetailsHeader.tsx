
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ShowDetailsHeaderProps {
  showsUrl: string;
}

const ShowDetailsHeader = ({ showsUrl }: ShowDetailsHeaderProps) => {
  return (
    <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
      <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
        <Link to={showsUrl} className="inline-flex items-center text-theatre-gray-light hover:text-theatre-light mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Tillbaka till föreställningar
        </Link>
      </div>
    </section>
  );
};

export default ShowDetailsHeader;
