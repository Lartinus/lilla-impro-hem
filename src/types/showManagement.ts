export interface ShowTag {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  is_active: boolean;
  sort_order?: number;
}

export interface AdminShow {
  id: string;
  title: string;
  slug: string;
  image_url?: string | null;
  show_date: string;
  show_time: string;
  venue: string;
  venue_address?: string | null;
  venue_maps_url?: string | null;
  description?: string | null;
  regular_price: number;
  discount_price: number;
  max_tickets?: number;
  is_active: boolean;
  sort_order?: number;
  tag_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminShowWithPerformers extends AdminShow {
  performers: Array<{
    id: string;
    name: string;
    bio: string;
    image_url?: string | null;
  }>;
  show_tag?: ShowTag | null;
}

export interface NewShowForm {
  title: string;
  slug: string;
  image_url: string;
  show_date: string;
  show_time: string;
  venue: string;
  venue_address: string;
  venue_maps_url: string;
  description: string;
  regular_price: number;
  discount_price: number;
  max_tickets: number;
  is_active: boolean;
  performer_ids: string[];
  tag_id?: string | null;
}

export interface ShowTemplate {
  id: string;
  name: string;
  title_template: string;
  description?: string | null;
  regular_price: number;
  discount_price: number;
  max_tickets?: number;
  is_active: boolean;
  sort_order?: number;
}

export interface Venue {
  id: string;
  name: string;
  address?: string | null;
  maps_url?: string | null;
  is_active: boolean;
  sort_order?: number;
}

export interface Actor {
  id: string;
  name: string;
  bio?: string | null;
  image_url?: string | null;
  is_active: boolean;
}