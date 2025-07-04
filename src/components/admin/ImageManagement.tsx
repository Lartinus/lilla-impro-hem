import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';

interface StorageFile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  metadata: Record<string, any>;
}

export const ImageManagement = () => {
  const isMobile = useIsMobile();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch images
  const { data: images, isLoading } = useQuery({
    queryKey: ['admin-images'],
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

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) throw error;
        return fileName;
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: (fileNames) => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      toast({
        title: "Bilder uppladdade",
        description: `${fileNames.length} bilder har laddats upp framgångsrikt.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Uppladdning misslyckades",
        description: "Ett fel uppstod vid uppladdning av bilderna.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      toast({
        title: "Bild raderad",
        description: "Bilden har tagits bort.",
      });
    },
    onError: () => {
      toast({
        title: "Radering misslyckades",
        description: "Ett fel uppstod vid radering av bilden.",
        variant: "destructive",
      });
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast({
        title: "Inga bilder valda",
        description: "Vänligen välj bildfiler (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    uploadMutation.mutate(files, {
      onSettled: () => setUploading(false)
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDeleteImage = (fileName: string) => {
    if (confirm(`Är du säker på att du vill radera "${fileName}"? Detta kan inte ångras.`)) {
      deleteMutation.mutate(fileName);
    }
  };

  const getImageUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bildhantering</CardTitle>
        <CardDescription>
          Ladda upp och hantera bilder för webbplatsen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? 'Släpp bilderna här' : 'Dra och släpp bilder här'}
          </h3>
          <p className="text-muted-foreground mb-4">
            eller klicka för att välja filer
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
          >
            {uploading ? 'Laddar upp...' : 'Välj bilder'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Image List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Laddar bilder...</p>
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga bilder uppladdade</h3>
            <p className="text-muted-foreground">
              Ladda upp din första bild för att komma igång.
            </p>
          </div>
        ) : isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={getImageUrl(image.name)}
                    alt={image.name}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{image.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(image.metadata?.size || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteImage(image.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative group">
                  <img
                    src={getImageUrl(image.name)}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Radera
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium truncate text-sm">{image.name}</h4>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatFileSize(image.metadata?.size || 0)}</span>
                    <span>{new Date(image.created_at).toLocaleDateString('sv-SE')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};