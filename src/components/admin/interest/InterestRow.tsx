import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Edit, Trash2, Users, ChevronUp, ChevronDown } from 'lucide-react';
import type { InterestSignupWithSubmissions } from '@/types/interestSignupManagement';

interface InterestRowProps {
  item: InterestSignupWithSubmissions;
  onEdit: (item: InterestSignupWithSubmissions) => void;
  onToggleVisibility: (item: InterestSignupWithSubmissions) => void;
  onDelete: (item: InterestSignupWithSubmissions) => void;
  onViewSubmissions: (item: InterestSignupWithSubmissions) => void;
  onMoveUp: (item: InterestSignupWithSubmissions) => void;
  onMoveDown: (item: InterestSignupWithSubmissions) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function InterestRow({
  item,
  onEdit,
  onToggleVisibility,
  onDelete,
  onViewSubmissions,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: InterestRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(item)}
              disabled={!canMoveUp}
              className="w-6 h-6 p-0"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(item)}
              disabled={!canMoveDown}
              className="w-6 h-6 p-0"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">#{item.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.title}</TableCell>
      <TableCell className="max-w-xs truncate">{item.subtitle || '-'}</TableCell>
      <TableCell>
        <span className="font-semibold">{item.submissionCount}</span>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_visible ? "default" : "secondary"}>
          {item.is_visible ? 'Synlig' : 'Dold'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewSubmissions(item)}
            disabled={item.submissionCount === 0}
          >
            <Users className="w-4 h-4 mr-1" />
            Visa anmälningar ({item.submissionCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleVisibility(item)}
          >
            {item.is_visible ? (
              <EyeOff className="w-4 h-4 mr-1" />
            ) : (
              <Eye className="w-4 h-4 mr-1" />
            )}
            {item.is_visible ? 'Dölj' : 'Visa'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm(`Är du säker på att du vill radera "${item.title}"? Detta kan inte ångras.`)) {
                onDelete(item);
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