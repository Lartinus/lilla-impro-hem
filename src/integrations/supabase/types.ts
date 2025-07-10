export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      actors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_shows: {
        Row: {
          created_at: string
          description: string | null
          discount_price: number
          id: string
          image_url: string | null
          is_active: boolean
          max_tickets: number | null
          regular_price: number
          show_date: string
          show_time: string
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
          venue: string
          venue_address: string | null
          venue_maps_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_tickets?: number | null
          regular_price?: number
          show_date: string
          show_time: string
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
          venue: string
          venue_address?: string | null
          venue_maps_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_tickets?: number | null
          regular_price?: number
          show_date?: string
          show_time?: string
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          venue?: string
          venue_address?: string | null
          venue_maps_url?: string | null
        }
        Relationships: []
      }
      course_bookings: {
        Row: {
          address: string | null
          city: string | null
          course_title: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          postal_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          course_title: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          postal_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          course_title?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          postal_code?: string | null
        }
        Relationships: []
      }
      course_course_niv_1_1752147042033_1752158584307: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          postal_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          postal_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          postal_code?: string | null
        }
        Relationships: []
      }
      course_instances: {
        Row: {
          completed_at: string | null
          course_info: string | null
          course_title: string
          created_at: string
          discount_price: number | null
          end_date: string | null
          hours_per_session: number | null
          id: string
          instructor: string | null
          instructor_id_1: string | null
          instructor_id_2: string | null
          is_active: boolean | null
          max_participants: number | null
          practical_info: string | null
          price: number | null
          sessions: number | null
          sort_order: number | null
          start_date: string | null
          start_time: string | null
          subtitle: string | null
          table_name: string
          weekday: string | null
        }
        Insert: {
          completed_at?: string | null
          course_info?: string | null
          course_title: string
          created_at?: string
          discount_price?: number | null
          end_date?: string | null
          hours_per_session?: number | null
          id?: string
          instructor?: string | null
          instructor_id_1?: string | null
          instructor_id_2?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          practical_info?: string | null
          price?: number | null
          sessions?: number | null
          sort_order?: number | null
          start_date?: string | null
          start_time?: string | null
          subtitle?: string | null
          table_name: string
          weekday?: string | null
        }
        Update: {
          completed_at?: string | null
          course_info?: string | null
          course_title?: string
          created_at?: string
          discount_price?: number | null
          end_date?: string | null
          hours_per_session?: number | null
          id?: string
          instructor?: string | null
          instructor_id_1?: string | null
          instructor_id_2?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          practical_info?: string | null
          price?: number | null
          sessions?: number | null
          sort_order?: number | null
          start_date?: string | null
          start_time?: string | null
          subtitle?: string | null
          table_name?: string
          weekday?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_instances_instructor_id_1_fkey"
            columns: ["instructor_id_1"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instances_instructor_id_2_fkey"
            columns: ["instructor_id_2"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      course_niv__1_1752147042033: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          postal_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          postal_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          postal_code?: string | null
        }
        Relationships: []
      }
      course_niv_1_scenarbete_improv_comedy_1749454350362: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          postal_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          postal_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          postal_code?: string | null
        }
        Relationships: []
      }
      course_niv_2_l_ngform_improviserad_komik_1749806847850: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          postal_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          postal_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          postal_code?: string | null
        }
        Relationships: []
      }
      course_templates: {
        Row: {
          course_info: string | null
          created_at: string
          discount_price: number | null
          hours_per_session: number
          id: string
          is_active: boolean
          max_participants: number
          name: string
          practical_info: string | null
          price: number
          sessions: number
          start_time: string | null
          subtitle: string | null
          title_template: string
          updated_at: string
        }
        Insert: {
          course_info?: string | null
          created_at?: string
          discount_price?: number | null
          hours_per_session?: number
          id?: string
          is_active?: boolean
          max_participants?: number
          name: string
          practical_info?: string | null
          price?: number
          sessions?: number
          start_time?: string | null
          subtitle?: string | null
          title_template: string
          updated_at?: string
        }
        Update: {
          course_info?: string | null
          created_at?: string
          discount_price?: number | null
          hours_per_session?: number
          id?: string
          is_active?: boolean
          max_participants?: number
          name?: string
          practical_info?: string | null
          price?: number
          sessions?: number
          start_time?: string | null
          subtitle?: string | null
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          discount_amount: number
          discount_type: string
          id: string
          is_active: boolean
          max_uses: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          discount_amount: number
          discount_type: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_amount?: number
          discount_type?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      email_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          source: string | null
          source_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string | null
          source_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string | null
          source_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_group_members: {
        Row: {
          added_at: string
          contact_id: string
          group_id: string
          id: string
        }
        Insert: {
          added_at?: string
          contact_id: string
          group_id: string
          id?: string
        }
        Update: {
          added_at?: string
          contact_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_group_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "email_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "email_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      email_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          background_image: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          image_position: string | null
          is_active: boolean
          name: string
          subject: string
          title: string | null
          title_size: string | null
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          image_position?: string | null
          is_active?: boolean
          name: string
          subject: string
          title?: string | null
          title_size?: string | null
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          image_position?: string | null
          is_active?: boolean
          name?: string
          subject?: string
          title?: string | null
          title_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          occasion: string | null
          phone: string | null
          requirements: string
          type: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          occasion?: string | null
          phone?: string | null
          requirements: string
          type: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          occasion?: string | null
          phone?: string | null
          requirements?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      interest_signup_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          interest_signup_id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest_signup_id: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest_signup_id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interest_signup_submissions_interest_signup_id_fkey"
            columns: ["interest_signup_id"]
            isOneToOne: false
            referencedRelation: "interest_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_signups: {
        Row: {
          created_at: string
          id: string
          information: string | null
          is_visible: boolean
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          information?: string | null
          is_visible?: boolean
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          information?: string | null
          is_visible?: boolean
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      performers: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      show_performers: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          show_id: string
          sort_order: number | null
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          show_id: string
          sort_order?: number | null
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          show_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "show_performers_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_performers_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "admin_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      show_templates: {
        Row: {
          created_at: string
          description: string | null
          discount_price: number
          id: string
          is_active: boolean
          max_tickets: number | null
          name: string
          regular_price: number
          sort_order: number | null
          title_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          is_active?: boolean
          max_tickets?: number | null
          name: string
          regular_price?: number
          sort_order?: number | null
          title_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_price?: number
          id?: string
          is_active?: boolean
          max_tickets?: number | null
          name?: string
          regular_price?: number
          sort_order?: number | null
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_bookings: {
        Row: {
          created_at: string
          discount_tickets: number
          expires_at: string
          id: string
          regular_tickets: number
          session_id: string
          show_slug: string
        }
        Insert: {
          created_at?: string
          discount_tickets?: number
          expires_at: string
          id?: string
          regular_tickets?: number
          session_id: string
          show_slug: string
        }
        Update: {
          created_at?: string
          discount_tickets?: number
          expires_at?: string
          id?: string
          regular_tickets?: number
          session_id?: string
          show_slug?: string
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          created_at: string
          discount_code: string | null
          discount_tickets: number
          id: string
          payment_status: string
          qr_data: string
          regular_tickets: number
          show_date: string
          show_location: string
          show_slug: string
          show_title: string
          stripe_session_id: string | null
          ticket_code: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          created_at?: string
          discount_code?: string | null
          discount_tickets?: number
          id?: string
          payment_status?: string
          qr_data: string
          regular_tickets?: number
          show_date: string
          show_location: string
          show_slug: string
          show_title: string
          stripe_session_id?: string | null
          ticket_code: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string
          created_at?: string
          discount_code?: string | null
          discount_tickets?: number
          id?: string
          payment_status?: string
          qr_data?: string
          regular_tickets?: number
          show_date?: string
          show_location?: string
          show_slug?: string
          show_title?: string
          stripe_session_id?: string | null
          ticket_code?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          maps_url: string | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          maps_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          maps_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_duplicate_course_booking: {
        Args: { table_name: string; email_address: string }
        Returns: boolean
      }
      cleanup_expired_bookings: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_course_booking_table: {
        Args: { table_name: string }
        Returns: undefined
      }
      create_interest_group_if_not_exists: {
        Args: { signup_title: string }
        Returns: string
      }
      create_ticket_booking: {
        Args: {
          show_slug_param: string
          regular_tickets_param: number
          discount_tickets_param: number
          session_id_param: string
        }
        Returns: {
          booking_id: string
          expires_at: string
        }[]
      }
      drop_course_booking_table: {
        Args: { table_name: string }
        Returns: undefined
      }
      generate_ticket_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_tickets: {
        Args: { show_slug_param: string; total_tickets: number }
        Returns: number
      }
      get_available_tickets_with_bookings: {
        Args: { show_slug_param: string; total_tickets: number }
        Returns: number
      }
      get_contact_activities: {
        Args: { contact_email: string }
        Returns: {
          activity_type: string
          activity_title: string
          activity_date: string
          details: Json
        }[]
      }
      get_course_booking_count: {
        Args: { table_name: string }
        Returns: number
      }
      get_course_participants: {
        Args: { table_name: string }
        Returns: {
          email: string
          name: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      import_course_to_group: {
        Args: { course_table_name: string; target_group_id: string }
        Returns: number
      }
      insert_course_booking: {
        Args: {
          table_name: string
          booking_name: string
          booking_phone: string
          booking_email: string
          booking_address?: string
          booking_postal_code?: string
          booking_city?: string
          booking_message?: string
        }
        Returns: undefined
      }
      is_valid_email: {
        Args: { email: string }
        Returns: boolean
      }
      is_valid_phone: {
        Args: { phone: string }
        Returns: boolean
      }
      sync_email_contacts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      table_exists: {
        Args: { table_name: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
