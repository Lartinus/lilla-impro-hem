/**
 * Generate URL-friendly slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[åäÅÄ]/g, 'a')
    .replace(/[öÖ]/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Generate title from template with date substitution
 */
export const generateTitleFromTemplate = (titleTemplate: string): string => {
  const currentDate = new Date().toLocaleDateString('sv-SE', { 
    day: 'numeric', 
    month: 'long' 
  });
  return titleTemplate.replace('{datum}', currentDate);
};

/**
 * Reset form to default values
 */
export const getDefaultShowForm = () => ({
  title: '',
  slug: '',
  image_url: '',
  show_date: '',
  show_time: '19:00',
  venue: 'Metropole',
  venue_address: '',
  venue_maps_url: '',
  description: '',
  regular_price: 300,
  discount_price: 250,
  max_tickets: 100,
  is_active: true,
  performer_ids: [],
  tag_id: null
});