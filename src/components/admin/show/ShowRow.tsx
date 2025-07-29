import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import ShowTag from '@/components/ShowTag';
import type { AdminShowWithPerformers } from '@/types/showManagement';

interface ShowRowProps {
  show: AdminShowWithPerformers;
  onEdit: (show: AdminShowWithPerformers) => void;
  onToggleVisibility: (show: AdminShowWithPerformers) => void;
  onDelete: (show: AdminShowWithPerformers) => void;
  onMoveUp: (show: AdminShowWithPerformers) => void;
  onMoveDown: (show: AdminShowWithPerformers) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ShowRow({ 
  show, 
  onEdit, 
  onToggleVisibility, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown 
}: ShowRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
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
          <span className="text-xs text-muted-foreground">#{show.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{show.title}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {new Date(show.show_date).toLocaleDateString('sv-SE')} {show.show_time.substring(0, 5)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {show.venue}
        </div>
      </TableCell>
      <TableCell>
        {show.show_tag ? (
          <ShowTag name={show.show_tag.name} color={show.show_tag.color} size="small" />
        ) : (
          <span className="text-muted-foreground text-sm">Ingen tag</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {show.regular_price}kr
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={show.is_active ? "default" : "secondary"}>
          {show.is_active ? 'Aktiv' : 'Dold'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(show)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleVisibility(show)}
          >
            {show.is_active ? (
              <EyeOff className="w-4 h-4 mr-1" />
            ) : (
              <Eye className="w-4 h-4 mr-1" />
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
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Radera
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}