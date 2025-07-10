import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { NewInterestSignupForm } from '@/types/interestSignupManagement';

interface InterestFormProps {
  formData: NewInterestSignupForm;
  onFormChange: (formData: NewInterestSignupForm) => void;
  isEditMode: boolean;
}

export function InterestForm({ formData, onFormChange, isEditMode }: InterestFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
          placeholder="T.ex. House Teams & fortsättning"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subtitle">Undertitel</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => onFormChange({ ...formData, subtitle: e.target.value })}
          placeholder="T.ex. Auditions hålls regelbundet"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="information">Information</Label>
        <Textarea
          id="information"
          value={formData.information}
          onChange={(e) => onFormChange({ ...formData, information: e.target.value })}
          placeholder="Beskrivning av vad detta är för typ av kurs/aktivitet"
          rows={6}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_visible"
          checked={formData.is_visible}
          onCheckedChange={(checked) => onFormChange({ ...formData, is_visible: checked })}
        />
        <Label htmlFor="is_visible">Visa på hemsidan</Label>
      </div>
    </div>
  );
}