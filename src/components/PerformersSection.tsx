
import { useState, useEffect } from 'react';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface Performer {
  id: number;
  name: string;
  image: string | null; // Image URL or data URL
  bio: string;
}

interface PerformersSectionProps {
  performers: Performer[];
  editable?: boolean;
  onPerformersChange?: (performers: Performer[]) => void;
}

const PerformersSection = ({
  performers: initialPerformers,
  editable = false,
  onPerformersChange,
}: PerformersSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [performers, setPerformers] = useState<Performer[]>(initialPerformers);

  // Sync with prop if it changes
  useEffect(() => {
    setPerformers(initialPerformers);
  }, [initialPerformers]);

  // Hantera LocalStorage för spara/ladda
  useEffect(() => {
    if (!editable) return;
    const savedPerformers = localStorage.getItem('about-performers');
    if (savedPerformers) {
      setPerformers(JSON.parse(savedPerformers));
    }
  }, [editable]);

  const handleEditClick = () => setIsEditing(true);

  const handleCancel = () => {
    // Återställ till lagrat (eller prop)
    const savedPerformers = localStorage.getItem('about-performers');
    setPerformers(savedPerformers ? JSON.parse(savedPerformers) : initialPerformers);
    setIsEditing(false);
  };

  const handleChange = (idx: number, field: keyof Performer, value: string | null) => {
    const updated = performers.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setPerformers(updated);
  };

  // Läs bild och konvertera till "data URL" för preview (lagras bara lokalt)
  const handleImageChange = (idx: number, file: File | null) => {
    if (!file) {
      handleChange(idx, 'image', null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(idx, 'image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem('about-performers', JSON.stringify(performers));
    setIsEditing(false);
    if (onPerformersChange) {
      onPerformersChange(performers);
    }
  };

  if (!performers || performers.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-800 font-bold">Produktionsteam</h4>
        {editable && !isEditing && (
          <button
            onClick={handleEditClick}
            className="ml-4 px-4 py-1 text-sm rounded bg-red-900 text-white hover:bg-red-800"
          >
            Redigera
          </button>
        )}
      </div>
      <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
        <div className="space-y-6">
          {performers.map((performer, idx) => (
            <div key={performer.id} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
              {/* Bild */}
              <div>
                {isEditing ? (
                  <div>
                    {performer.image ? (
                      <img
                        src={performer.image}
                        alt="Preview"
                        className="w-32 h-32 rounded-none object-cover object-top mb-2"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-300 rounded-none flex items-center justify-center mb-2">
                        <span className="text-gray-600 text-sm">Ingen bild</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="block"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageChange(idx, e.target.files[0]);
                        }
                      }}
                    />
                    {performer.image && (
                      <button
                        className="text-xs mt-1 px-2 py-0.5 bg-gray-200 rounded"
                        onClick={() => handleImageChange(idx, null)}
                        type="button"
                      >
                        Ta bort bild
                      </button>
                    )}
                  </div>
                ) : performer.image ? (
                  <img
                    src={performer.image}
                    alt={performer.name}
                    className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 rounded-none flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-sm">Ingen bild</span>
                  </div>
                )}
              </div>
              {/* Namn/bio */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={performer.name}
                      placeholder="Namn"
                      onChange={e => handleChange(idx, 'name', e.target.value)}
                      className="border border-gray-400 px-2 py-1 mb-2 w-full rounded"
                    />
                    <textarea
                      rows={3}
                      value={performer.bio}
                      placeholder="Kort biografi"
                      onChange={e => handleChange(idx, 'bio', e.target.value)}
                      className="border border-gray-400 px-2 py-1 w-full rounded"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="font-bold text-gray-800 performer-name mb-0">{performer.name}</h5>
                    <div
                      className="text-gray-700 text-sm break-words performer-bio [&>p]:mb-1 [&>p]:mt-0"
                      style={{
                        marginTop: 'var(--name-to-bio-spacing)',
                        paddingTop: '0',
                        lineHeight: 'var(--body-line-height)',
                      }}
                      dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(performer.bio) }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {editable && isEditing && (
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-1 rounded bg-green-700 text-white hover:bg-green-800"
            >
              Spara
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Avbryt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformersSection;
