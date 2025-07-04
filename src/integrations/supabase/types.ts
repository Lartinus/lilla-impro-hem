export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      course_helgworkshops_specialkurser_1751354357209: {
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
          course_info: string | null
          course_title: string
          created_at: string
          discount_price: number | null
          end_date: string | null
          hours_per_session: number | null
          id: string
          instructor: string | null
          is_active: boolean | null
          max_participants: number | null
          practical_info: string | null
          price: number | null
          sessions: number | null
          sort_order: number | null
          start_date: string | null
          subtitle: string | null
          table_name: string
        }
        Insert: {
          course_info?: string | null
          course_title: string
          created_at?: string
          discount_price?: number | null
          end_date?: string | null
          hours_per_session?: number | null
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          practical_info?: string | null
          price?: number | null
          sessions?: number | null
          sort_order?: number | null
          start_date?: string | null
          subtitle?: string | null
          table_name: string
        }
        Update: {
          course_info?: string | null
          course_title?: string
          created_at?: string
          discount_price?: number | null
          end_date?: string | null
          hours_per_session?: number | null
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          practical_info?: string | null
          price?: number | null
          sessions?: number | null
          sort_order?: number | null
          start_date?: string | null
          subtitle?: string | null
          table_name?: string
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
      get_course_booking_count: {
        Args: { table_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
