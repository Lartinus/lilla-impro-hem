import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Actor {
  id: string;
  name: string;
  bio?: string | null;
  image_url?: string | null;
}

interface ActorSelectorProps {
  actors: Actor[];
  selectedActorIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelection: number;
}

export const ActorSelector: React.FC<ActorSelectorProps> = ({
  actors,
  selectedActorIds,
  onSelectionChange,
  maxSelection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedActors = useMemo(() => {
    return actors.filter(actor => selectedActorIds.includes(actor.id));
  }, [actors, selectedActorIds]);

  const filteredActors = useMemo(() => {
    return actors.filter(actor =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [actors, searchTerm]);

  const handleActorToggle = (actorId: string) => {
    if (selectedActorIds.includes(actorId)) {
      // Remove actor
      onSelectionChange(selectedActorIds.filter(id => id !== actorId));
    } else {
      // Add actor if under limit
      if (selectedActorIds.length < maxSelection) {
        onSelectionChange([...selectedActorIds, actorId]);
      }
    }
  };

  const removeActor = (actorId: string) => {
    onSelectionChange(selectedActorIds.filter(id => id !== actorId));
  };

  return (
    <div className="space-y-2">
      {/* Selected actors display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-input rounded-md bg-background">
        {selectedActors.length > 0 ? (
          selectedActors.map(actor => (
            <Badge key={actor.id} variant="secondary" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {actor.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeActor(actor.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Inga skådespelare valda</span>
        )}
      </div>

      {/* Selector dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            disabled={selectedActorIds.length >= maxSelection}
          >
            <Search className="w-4 h-4 mr-2" />
            {selectedActorIds.length >= maxSelection 
              ? `Max antal skådespelare valda (${maxSelection})`
              : 'Välj skådespelare...'
            }
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Välj skådespelare</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Sök skådespelare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Actor list */}
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {filteredActors.length > 0 ? (
                  filteredActors.map(actor => {
                    const isSelected = selectedActorIds.includes(actor.id);
                    const isDisabled = !isSelected && selectedActorIds.length >= maxSelection;
                    
                    return (
                      <div
                        key={actor.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-primary/20' 
                            : isDisabled
                            ? 'bg-muted/50 border-muted opacity-50'
                            : 'hover:bg-muted/50 border-border'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => handleActorToggle(actor.id)}
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            {actor.image_url ? (
                              <img 
                                src={actor.image_url} 
                                alt={actor.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{actor.name}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Inga skådespelare hittades</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Selection info */}
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              {selectedActorIds.length}/{maxSelection} skådespelare valda
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};