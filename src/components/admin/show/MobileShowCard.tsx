import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import ShowTag from '@/components/ShowTag';
import type { AdminShowWithPerformers } from '@/types/showManagement';

interface MobileShowCardProps {
  show: AdminShowWithPerformers;
  index: number;
  totalShows: number;
  showCompleted?: boolean;
  onEdit: (show: AdminShowWithPerformers) => void;
  onToggleVisibility: (show: AdminShowWithPerformers) => void;
  onDelete: (show: AdminShowWithPerformers) => void;
  onMoveUp: (show: AdminShowWithPerformers) => void;
  onMoveDown: (show: AdminShowWithPerformers) => void;
}

export function MobileShowCard({
  show,
  index,
  totalShows,
  showCompleted = false,
  onEdit,
  onToggleVisibility,
  onDelete,
  onMoveUp,
  onMoveDown
}: MobileShowCardProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < totalShows - 1;

  return (
    <Card className="p-4 sm:p-6 border-2 border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {!showCompleted && (
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveUp(show)}
                disabled={!canMoveUp}
                className="w-6 h-6 p-0"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveDown(show)}
                disabled={!canMoveDown}
                className="w-6 h-6 p-0"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {!showCompleted && (
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  #{show.sort_order || 0}
                </span>
              )}
              <Badge 
                variant={show.is_active ? "default" : "secondary"}
                className="text-xs"
              >
                {show.is_active ? 'Aktiv' : 'Dold'}
              </Badge>
            </div>
            <h4 className="font-semibold text-base mb-3">{show.title}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{new Date(show.show_date).toLocaleDateString('sv-SE')} {show.show_time.substring(0, 5)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{show.venue}</span>
              </div>
              {show.show_tags && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {show.show_tags.map((t) => (
                    <ShowTag key={t.id} name={t.name} color={t.color} size="small" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-lg font-semibold bg-primary/10 px-3 py-2 rounded-lg">
            <span>{show.regular_price}kr</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(show)}
          className="w-full justify-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Redigera
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onToggleVisibility(show)}
          className="w-full justify-center"
        >
          {show.is_active ? (
            <EyeOff className="w-4 h-4 mr-2" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          {show.is_active ? 'Dölj' : 'Visa'}
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => {
            if (confirm(`Är du säker på att du vill radera "${show.title}"? Detta kan inte ångras.`)) {
              onDelete(show);
            }
          }}
          className="w-full justify-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Radera
        </Button>
      </div>
    </Card>
  );
}