import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Check } from 'lucide-react';

interface StorageFile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  metadata: Record<string, any>;
}

interface ImagePickerProps {
  value?: string;
  onSelect: (imageUrl: string) => void;
  triggerClassName?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onSelect,
  triggerClassName = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(value || '');

  // Fetch images
  const { data: images, isLoading } = useQuery({
    queryKey: ['admin-images-picker'],
    queryFn: async (): Promise<StorageFile[]> => {
      const { data, error } = await supabase.storage
        .from('images')
        .list('', {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const getImageUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSelect = (fileName: string) => {
    const imageUrl = getImageUrl(fileName);
    setSelectedUrl(imageUrl);
    onSelect(imageUrl);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedUrl('');
    onSelect('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <ImageIcon className="w-4 h-4 mr-2" />
          {value ? 'Ändra bild' : 'Välj bild'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Välj bild</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Clear selection option */}
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="w-full"
          >
            Ingen bild
          </Button>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Laddar bilder...</p>
            </div>
          ) : !images || images.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Inga bilder tillgängliga</h3>
              <p className="text-muted-foreground">
                Gå till bildhantering för att ladda upp bilder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => {
                const imageUrl = getImageUrl(image.name);
                const isSelected = selectedUrl === imageUrl;
                
                return (
                  <Card 
                    key={image.id} 
                    className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelect(image.name)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={imageUrl}
                        alt={image.name}
                        className="w-full h-full object-cover rounded-t"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-t">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs truncate">{image.name}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};