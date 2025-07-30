
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import OptimizedImage from './OptimizedImage';

export interface Performer {
  id: number;
  name: string;
  image: string | null;
  bio: string;
}

interface PerformersSectionProps {
  performers: Performer[];
  title?: string;
}

const PerformersSection = ({
  performers,
  title = 'Medverkande'
}: PerformersSectionProps) => {
  if (!performers || performers.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-3">{title}</h2>
      <div className="bg-theatre-light/10 rounded-none border-red-800 border-3 p-4">
        <div className="space-y-2">
          {performers.map((perf) => {
            const hasImage =
              perf.image &&
              perf.image !== 'null' &&
              perf.image.trim() !== '' &&
              perf.image !== 'undefined';

            return (
              <div
                key={perf.id}
                className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4"
              >
                {hasImage ? (
                  <OptimizedImage
                    src={perf.image!}
                    alt={perf.name}
                    className="w-32 h-32 object-cover object-top flex-shrink-0"
                    preferredSize="small"
                    fallbackText="Ingen bild"
                  />
                ) : (
                  <div className="w-32 h-32 bg-surface-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-content-muted text-sm">Ingen bild</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-content-primary">{perf.name}</p>
                  <div
                    className="text-content-secondary break-words mt-1 performer-bio"
                    style={{ 
                      lineHeight: 'var(--body-line-height)',
                      fontSize: 'clamp(0.95rem, 2.5vw, 0.8rem)'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: convertMarkdownToHtml(perf.bio)
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformersSection;
