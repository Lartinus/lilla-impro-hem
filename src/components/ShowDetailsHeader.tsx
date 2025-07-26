
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ShowDetailsHeaderProps {
  showsUrl: string;
}

const ShowDetailsHeader = ({ showsUrl }: ShowDetailsHeaderProps) => {
  return (
    <section>
      <div className="mx-[12px] mt-[95px] md:mx-0 md:max-w-4xl md:mx-auto">
        <Link to={showsUrl} className="inline-flex items-center text-theatre-light hover:text-theatre-light/80 mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Tillbaka till föreställningar
        </Link>
      </div>
    </section>
  );
};

export default ShowDetailsHeader;
