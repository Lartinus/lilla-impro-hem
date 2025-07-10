import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Edit, Trash2, Users, ChevronUp, ChevronDown } from 'lucide-react';
import type { InterestSignupWithSubmissions } from '@/types/interestSignupManagement';

interface MobileInterestCardProps {
  item: InterestSignupWithSubmissions;
  index: number;
  totalItems: number;
  onEdit: (item: InterestSignupWithSubmissions) => void;
  onToggleVisibility: (item: InterestSignupWithSubmissions) => void;
  onDelete: (item: InterestSignupWithSubmissions) => void;
  onViewSubmissions: (item: InterestSignupWithSubmissions) => void;
  onMoveUp: (item: InterestSignupWithSubmissions) => void;
  onMoveDown: (item: InterestSignupWithSubmissions) => void;
}

export function MobileInterestCard({
  item,
  index,
  totalItems,
  onEdit,
  onToggleVisibility,
  onDelete,
  onViewSubmissions,
  onMoveUp,
  onMoveDown
}: MobileInterestCardProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < totalItems - 1;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">#{item.sort_order || 0}</span>
              <Badge variant={item.is_visible ? "default" : "secondary"}>
                {item.is_visible ? 'Synlig' : 'Dold'}
              </Badge>
            </div>
            <h4 className="font-medium">{item.title}</h4>
            {item.subtitle && (
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{item.submissionCount}</div>
          <div className="text-xs text-muted-foreground">anmälda</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
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
    </Card>
  );
}