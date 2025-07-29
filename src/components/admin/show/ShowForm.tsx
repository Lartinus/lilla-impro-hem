import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImagePicker } from '../ImagePicker';
import { ActorSelector } from '../ActorSelector';
import type { NewShowForm, ShowTemplate, Venue, Actor, ShowTag } from '@/types/showManagement';
import { generateSlug, generateTitleFromTemplate } from '@/utils/showUtils';

interface ShowFormProps {
  newShow: NewShowForm;
  setNewShow: React.Dispatch<React.SetStateAction<NewShowForm>>;
  isEditMode: boolean;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  showTemplates?: ShowTemplate[];
  venues?: Venue[];
  actors?: Actor[];
  showTags?: ShowTag[];
}

export function ShowForm({
  newShow,
  setNewShow,
  isEditMode,
  selectedTemplate,
  setSelectedTemplate,
  showTemplates,
  venues,
  actors,
  showTags
}: ShowFormProps) {
  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = showTemplates?.find(t => t.id === templateId);
      if (template) {
        const generatedTitle = generateTitleFromTemplate(template.title_template);
        
        setNewShow(prev => ({
          ...prev,
          title: generatedTitle,
          slug: generateSlug(generatedTitle),
          description: template.description || '',
          regular_price: template.regular_price / 100, // Convert from öre to kr
          discount_price: template.discount_price / 100, // Convert from öre to kr
          max_tickets: template.max_tickets || 100
        }));
      }
    }
  };

  return (
    <div className="space-y-4">
      {!isEditMode && (
        <div>
          <Label htmlFor="template">Föreställningsmall (valfritt)</Label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelection(e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
          >
            <option value="">Välj mall eller skapa från början...</option>
            {showTemplates?.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.regular_price / 100}kr
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Välj en mall för att förifyllda formuläret med standardvärden
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={newShow.title}
            onChange={(e) => {
              const title = e.target.value;
              setNewShow(prev => ({
                ...prev,
                title,
                slug: generateSlug(title)
              }));
            }}
            placeholder="Föreställningens titel"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={newShow.slug}
            onChange={(e) => setNewShow(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="url-vanlig-slug"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Bild</Label>
        <ImagePicker
          value={newShow.image_url}
          onSelect={(url) => setNewShow(prev => ({ ...prev, image_url: url }))}
          triggerClassName="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="show_date">Datum</Label>
          <Input
            id="show_date"
            type="date"
            value={newShow.show_date}
            onChange={(e) => setNewShow(prev => ({ ...prev, show_date: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="show_time">Tid</Label>
          <Input
            id="show_time"
            type="time"
            value={newShow.show_time}
            onChange={(e) => setNewShow(prev => ({ ...prev, show_time: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="venue">Plats</Label>
        <select
          id="venue"
          value={newShow.venue}
          onChange={(e) => {
            const selectedVenue = venues?.find(v => v.name === e.target.value);
            setNewShow(prev => ({
              ...prev,
              venue: e.target.value,
              venue_address: selectedVenue?.address || '',
              venue_maps_url: selectedVenue?.maps_url || ''
            }));
          }}
          className="w-full px-3 py-2 border border-input bg-background rounded-md z-50"
        >
          <option value="">Välj plats...</option>
          {venues?.map((venue) => (
            <option key={venue.id} value={venue.name}>
              {venue.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="tag">Tag (valfritt)</Label>
        <select
          id="tag"
          value={newShow.tag_id || ''}
          onChange={(e) => setNewShow(prev => ({ ...prev, tag_id: e.target.value || null }))}
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="">Ingen tag...</option>
          {showTags?.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Välj en tag för att kategorisera föreställningen
        </p>
      </div>

      <div>
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea
          id="description"
          value={newShow.description}
          onChange={(e) => setNewShow(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Beskrivning av föreställningen..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="regular_price">Ordinarie pris (kr)</Label>
          <Input
            id="regular_price"
            type="number"
            value={newShow.regular_price}
            onChange={(e) => setNewShow(prev => ({ ...prev, regular_price: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="discount_price">Rabatterat pris (kr)</Label>
          <Input
            id="discount_price"
            type="number"
            value={newShow.discount_price}
            onChange={(e) => setNewShow(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="max_tickets">Max antal biljetter</Label>
          <Input
            id="max_tickets"
            type="number"
            value={newShow.max_tickets}
            onChange={(e) => setNewShow(prev => ({ ...prev, max_tickets: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label>Skådespelare (max 12)</Label>
        <ActorSelector
          actors={actors || []}
          selectedActorIds={newShow.performer_ids}
          onSelectionChange={(ids) => setNewShow(prev => ({ ...prev, performer_ids: ids }))}
          maxSelection={12}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {newShow.performer_ids.length}/12 skådespelare valda
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={newShow.is_active}
          onCheckedChange={(checked) => setNewShow(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Aktiv föreställning</Label>
      </div>
    </div>
  );
}