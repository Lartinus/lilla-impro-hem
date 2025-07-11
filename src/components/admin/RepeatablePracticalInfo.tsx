import React, { useState, useEffect } from 'react';
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
  // Parse the existing practical info into an array, excluding base info items
  const parseAdditionalItems = (infoString: string, baseInfoString?: string) => {
    if (!infoString) return [''];
    
    const allItems = infoString.split('\n').filter(item => item.trim() !== '');
    const baseItems = baseInfoString ? baseInfoString.split('\n').filter(item => item.trim() !== '') : [];
    
    // Filter out base items from the current value to get only additional items
    const additionalItems = allItems.filter(item => !baseItems.includes(item));
    
    return additionalItems.length > 0 ? additionalItems : [''];
  };

  const [additionalItems, setAdditionalItems] = useState<string[]>(() => {
    const parsed = parseAdditionalItems(value, baseInfo);
    return parsed;
  });

  // Update when baseInfo changes
  useEffect(() => {
    const parsed = parseAdditionalItems(value, baseInfo);
    setAdditionalItems(parsed);
  }, [baseInfo]);

  const updateValue = (newAdditionalItems: string[]) => {
    setAdditionalItems(newAdditionalItems);
    
    // Only save additional items, not base info
    const filteredAdditionalItems = newAdditionalItems.filter(item => item.trim() !== '');
    onChange(filteredAdditionalItems.join('\n'));
  };

  const addItem = () => {
    const newItems = [...additionalItems, ''];
    updateValue(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = additionalItems.filter((_, i) => i !== index);
    updateValue(newItems);
  };

  const updateItem = (index: number, newValue: string) => {
    const newItems = [...additionalItems];
    newItems[index] = newValue;
    updateValue(newItems);
  };

  const baseItems = baseInfo ? baseInfo.split('\n').filter(item => item.trim() !== '') : [];

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
      
      {baseItems.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground mb-2">Befintlig praktisk information:</p>
          <div className="text-sm space-y-1">
            {baseItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0 mt-2"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {additionalItems.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="T.ex. Ta med bekväma kläder"
              className="flex-1"
            />
            {additionalItems.length > 1 && (
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
      
      {additionalItems.length === 1 && additionalItems[0] === '' && (
        <p className="text-sm text-muted-foreground italic">
          Klicka på "Lägg till" för att lägga till ytterligare praktisk information.
        </p>
      )}
    </div>
  );
};