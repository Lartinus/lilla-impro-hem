
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

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
      <h4 className="text-content-primary font-bold mb-3">{title}</h4>
      <div className="bg-theatre-light/10 rounded-none border-red-800 border-3 p-4">
        <div className="space-y-6">
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
                  <img
                    src={perf.image!}
                    alt={perf.name}
                    className="w-32 h-32 object-cover object-top flex-shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-surface-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-content-muted text-sm">Ingen bild</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-content-primary mb-1">{perf.name}</h5>
                  <div
                    className="text-content-secondary break-words mt-2 text-[14px] md:text-[13px] lg:text-[6px] [&>p]:mb-1 [&>p]:mt-0"
                    style={{ lineHeight: 'var(--body-line-height)' }}
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
