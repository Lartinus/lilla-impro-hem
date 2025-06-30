import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface Performer {
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
  title = "Medverkande"
}: PerformersSectionProps) => {
  console.log('PerformersSection - performers:', performers);
  if (!performers || performers.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-3">{title}</h2>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="space-y-6">
          {performers.map(performer => {
            // Check if we have a valid image URL
            const hasValidImage =
              performer.image &&
              performer.image !== 'null' &&
              performer.image.trim() !== '' &&
              performer.image !== 'undefined';

            console.log(
              'PerformersSection - performer:',
              performer.name,
              'imageUrl:',
              performer.image,
              'hasValidImage:',
              hasValidImage
            );

            return (
              <div
                key={performer.id}
                className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4"
              >
                {hasValidImage && (
                  <img
                    src={performer.image!}
                    alt={performer.name}
                    className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                    onError={e => {
                      console.error('Failed to load performer image:', performer.image);
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                    onLoad={() => {
                      console.log('Successfully loaded performer image:', performer.image);
                    }}
                  />
                )}

                {/* Fallback div */}
                <div
                  className="w-32 h-32 bg-gray-300 rounded-none flex items-center justify-center flex-shrink-0"
                  style={{ display: hasValidImage ? 'none' : 'flex' }}
                >
                  <span className="text-gray-600 text-sm">Ingen bild</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h6 className="performer-name mb-0">{performer.name}</h6>
                  <div
                    className="
                      performer-bio
                      break-words
                      mt-1
                      [&>p]:mb-1 [&>p]:mt-0
                      [&>h1]:mb-0.5 [&>h2]:mb-0.5 [&>h3]:mb-0.5
                      [&>h4]:mb-0.5 [&>h5]:mb-0.5 [&>h6]:mb-0.5
                      [&>*:first-child]:mt-0
                    "
                    style={{ lineHeight: 'var(--body-line-height)' }}
                    dangerouslySetInnerHTML={{
                      __html: convertMarkdownToHtml(performer.bio)
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
