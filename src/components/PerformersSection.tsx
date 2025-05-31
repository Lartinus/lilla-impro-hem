
interface Performer {
  id: number;
  name: string;
  image: string;
  bio: string;
}

interface PerformersSectionProps {
  performers: Performer[];
}

const PerformersSection = ({ performers }: PerformersSectionProps) => {
  if (!performers || performers.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-3">Medverkande</h4>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="space-y-6">
          {performers.map((performer) => (
            <div key={performer.id} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
              <img 
                src={performer.image} 
                alt={performer.name}
                className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-gray-800 performer-name">
                  {performer.name}
                </h5>
                <p 
                  className="text-gray-700 leading-relaxed text-sm break-words" 
                  style={{ 
                    lineHeight: '1.3',
                    marginTop: 'var(--name-to-bio-spacing)'
                  }}
                >
                  {performer.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformersSection;
