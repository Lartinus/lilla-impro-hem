import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface RepeatablePracticalInfoProps {
  value: string;
  onChange: (value: string) => void;
  baseInfo?: string;
}

export const RepeatablePracticalInfo = ({ value, onChange, baseInfo }: RepeatablePracticalInfoProps) => {
  // Parse the existing practical info into an array
  const parseItems = (infoString: string) => {
    if (!infoString) return [''];
    return infoString.split('\n').filter(item => item.trim() !== '');
  };

  const [items, setItems] = useState<string[]>(() => {
    const parsed = parseItems(value);
    return parsed.length > 0 ? parsed : [''];
  });

  const updateValue = (newItems: string[]) => {
    setItems(newItems);
    
    // Combine base info with additional items
    const baseItems = baseInfo ? parseItems(baseInfo) : [];
    const filteredNewItems = newItems.filter(item => item.trim() !== '');
    const allItems = [...baseItems, ...filteredNewItems];
    
    onChange(allItems.join('\n'));
  };

  const addItem = () => {
    const newItems = [...items, ''];
    updateValue(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateValue(newItems);
  };

  const updateItem = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    updateValue(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Ytterligare praktisk information</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Lägg till
        </Button>
      </div>
      
      {baseInfo && (
        <div className="p-3 bg-muted/30 rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground mb-2">Befintlig praktisk information:</p>
          <div className="text-sm space-y-1">
            {parseItems(baseInfo).map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0 mt-2"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="T.ex. Ta med bekväma kläder"
              className="flex-1"
            />
            {items.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                className="px-2"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Klicka på "Lägg till" för att lägga till ytterligare praktisk information.
        </p>
      )}
    </div>
  );
};