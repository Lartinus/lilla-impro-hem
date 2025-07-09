export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  background_image?: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

export interface EmailGroup {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmailContact {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  contact_id: string;
  contact: EmailContact;
}

export interface EmailManagementProps {
  activeTab?: string;
}