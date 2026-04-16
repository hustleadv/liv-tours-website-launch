export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      booking_communications: {
        Row: {
          booking_id: string
          communication_type: string
          created_at: string
          id: string
          initiated_by: string | null
          notes: string | null
        }
        Insert: {
          booking_id: string
          communication_type: string
          created_at?: string
          id?: string
          initiated_by?: string | null
          notes?: string | null
        }
        Update: {
          booking_id?: string
          communication_type?: string
          created_at?: string
          id?: string
          initiated_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_communications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          booking_id: string
          booking_type: string | null
          child_seat: number | null
          confirmed_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          date: string
          deposit_paid: number | null
          driver_id: string | null
          driver_language: string | null
          driver_message_sent: boolean | null
          driver_message_sent_at: string | null
          driver_name: string | null
          driver_phone: string | null
          dropoff: string
          extra_stop: boolean | null
          id: string
          is_airport_route: boolean | null
          is_port_route: boolean | null
          luggage: string | null
          meet_greet: boolean | null
          paid_at: string | null
          passengers: string
          payment_amount: number | null
          payment_status: string | null
          payment_type: string | null
          pickup: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          time: string
          total_amount: number | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          admin_notes?: string | null
          booking_id: string
          booking_type?: string | null
          child_seat?: number | null
          confirmed_at?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          date: string
          deposit_paid?: number | null
          driver_id?: string | null
          driver_language?: string | null
          driver_message_sent?: boolean | null
          driver_message_sent_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff: string
          extra_stop?: boolean | null
          id?: string
          is_airport_route?: boolean | null
          is_port_route?: boolean | null
          luggage?: string | null
          meet_greet?: boolean | null
          paid_at?: string | null
          passengers: string
          payment_amount?: number | null
          payment_status?: string | null
          payment_type?: string | null
          pickup: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          time: string
          total_amount?: number | null
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          admin_notes?: string | null
          booking_id?: string
          booking_type?: string | null
          child_seat?: number | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          date?: string
          deposit_paid?: number | null
          driver_id?: string | null
          driver_language?: string | null
          driver_message_sent?: boolean | null
          driver_message_sent_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          dropoff?: string
          extra_stop?: boolean | null
          id?: string
          is_airport_route?: boolean | null
          is_port_route?: boolean | null
          luggage?: string | null
          meet_greet?: boolean | null
          paid_at?: string | null
          passengers?: string
          payment_amount?: number | null
          payment_status?: string | null
          payment_type?: string | null
          pickup?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          time?: string
          total_amount?: number | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          language: string | null
          name: string
          notes: string | null
          phone: string
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string | null
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          language?: string | null
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      fixed_prices: {
        Row: {
          created_at: string
          currency: string
          dropoff_name: string
          fixed_price_eur: number
          id: string
          is_fixed_price: boolean
          passengers_max: number
          passengers_min: number
          pickup_zone: string
          region: string
          tags: string[] | null
          updated_at: string
          vehicle_class: string
        }
        Insert: {
          created_at?: string
          currency?: string
          dropoff_name: string
          fixed_price_eur: number
          id?: string
          is_fixed_price?: boolean
          passengers_max?: number
          passengers_min?: number
          pickup_zone: string
          region: string
          tags?: string[] | null
          updated_at?: string
          vehicle_class?: string
        }
        Update: {
          created_at?: string
          currency?: string
          dropoff_name?: string
          fixed_price_eur?: number
          id?: string
          is_fixed_price?: boolean
          passengers_max?: number
          passengers_min?: number
          pickup_zone?: string
          region?: string
          tags?: string[] | null
          updated_at?: string
          vehicle_class?: string
        }
        Relationships: []
      }
      location_aliases: {
        Row: {
          alias: string
          canonical_name: string
          created_at: string
          id: string
          is_active: boolean
          location_type: string
          updated_at: string
        }
        Insert: {
          alias: string
          canonical_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: string
          updated_at?: string
        }
        Update: {
          alias?: string
          canonical_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_tips: {
        Row: {
          confidence: number | null
          created_at: string
          generation_error: string | null
          id: string
          is_manual_override: boolean | null
          last_generation_attempt: string | null
          last_updated: string | null
          lat: number | null
          location_id: string
          location_name: string
          location_type: string | null
          lon: number | null
          manual_tip: string | null
          source_summary: string | null
          status: string | null
          tip_text: string | null
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          generation_error?: string | null
          id?: string
          is_manual_override?: boolean | null
          last_generation_attempt?: string | null
          last_updated?: string | null
          lat?: number | null
          location_id: string
          location_name: string
          location_type?: string | null
          lon?: number | null
          manual_tip?: string | null
          source_summary?: string | null
          status?: string | null
          tip_text?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          generation_error?: string | null
          id?: string
          is_manual_override?: boolean | null
          last_generation_attempt?: string | null
          last_updated?: string | null
          lat?: number | null
          location_id?: string
          location_name?: string
          location_type?: string | null
          lon?: number | null
          manual_tip?: string | null
          source_summary?: string | null
          status?: string | null
          tip_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tour_fun_facts: {
        Row: {
          created_at: string
          fun_fact_last_generated_at: string | null
          fun_fact_source_url: string | null
          fun_fact_text: string | null
          id: string
          primary_stop_name: string | null
          tour_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fun_fact_last_generated_at?: string | null
          fun_fact_source_url?: string | null
          fun_fact_text?: string | null
          id?: string
          primary_stop_name?: string | null
          tour_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fun_fact_last_generated_at?: string | null
          fun_fact_source_url?: string | null
          fun_fact_text?: string | null
          id?: string
          primary_stop_name?: string | null
          tour_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tour_requests: {
        Row: {
          addons: string[] | null
          admin_notes: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          deposit_amount: number | null
          discount_amount: number | null
          discount_applied: boolean | null
          driver_id: string | null
          driver_language: string | null
          driver_message_sent: boolean | null
          driver_message_sent_at: string | null
          driver_name: string | null
          driver_phone: string | null
          duration: string | null
          estimated_total: number | null
          final_price: number | null
          group_size: string | null
          id: string
          itinerary_title: string | null
          notes: string | null
          paid_at: string | null
          payment_status: string
          payment_type: string | null
          pickup_area: string | null
          preferred_date: string | null
          preferred_time: string | null
          price_confirmed_at: string | null
          price_sent_at: string | null
          request_id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tour_vibe: string | null
          updated_at: string
        }
        Insert: {
          addons?: string[] | null
          admin_notes?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          discount_applied?: boolean | null
          driver_id?: string | null
          driver_language?: string | null
          driver_message_sent?: boolean | null
          driver_message_sent_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          duration?: string | null
          estimated_total?: number | null
          final_price?: number | null
          group_size?: string | null
          id?: string
          itinerary_title?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          payment_type?: string | null
          pickup_area?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          price_confirmed_at?: string | null
          price_sent_at?: string | null
          request_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tour_vibe?: string | null
          updated_at?: string
        }
        Update: {
          addons?: string[] | null
          admin_notes?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          discount_applied?: boolean | null
          driver_id?: string | null
          driver_language?: string | null
          driver_message_sent?: boolean | null
          driver_message_sent_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          duration?: string | null
          estimated_total?: number | null
          final_price?: number | null
          group_size?: string | null
          id?: string
          itinerary_title?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          payment_type?: string | null
          pickup_area?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          price_confirmed_at?: string | null
          price_sent_at?: string | null
          request_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tour_vibe?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          best_for: string[]
          category: Database["public"]["Enums"]["tour_category"]
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["tour_difficulty"]
          duration_hours: number
          highlights: string[]
          id: string
          images: Json
          includes: string[]
          pickup_options: string[]
          popular_score: number | null
          price_from_eur: number | null
          region: Database["public"]["Enums"]["tour_region"]
          seasonality: string[]
          short_teaser: string | null
          slug: string
          source_summary: string | null
          status: Database["public"]["Enums"]["tour_status"]
          stops: Json
          tags: string[]
          time_type: Database["public"]["Enums"]["tour_time_type"]
          title: string
          updated_at: string
          walking_level: Database["public"]["Enums"]["tour_walking_level"]
          weather_fit: string[]
        }
        Insert: {
          best_for?: string[]
          category: Database["public"]["Enums"]["tour_category"]
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["tour_difficulty"]
          duration_hours?: number
          highlights?: string[]
          id?: string
          images?: Json
          includes?: string[]
          pickup_options?: string[]
          popular_score?: number | null
          price_from_eur?: number | null
          region: Database["public"]["Enums"]["tour_region"]
          seasonality?: string[]
          short_teaser?: string | null
          slug: string
          source_summary?: string | null
          status?: Database["public"]["Enums"]["tour_status"]
          stops?: Json
          tags?: string[]
          time_type?: Database["public"]["Enums"]["tour_time_type"]
          title: string
          updated_at?: string
          walking_level?: Database["public"]["Enums"]["tour_walking_level"]
          weather_fit?: string[]
        }
        Update: {
          best_for?: string[]
          category?: Database["public"]["Enums"]["tour_category"]
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["tour_difficulty"]
          duration_hours?: number
          highlights?: string[]
          id?: string
          images?: Json
          includes?: string[]
          pickup_options?: string[]
          popular_score?: number | null
          price_from_eur?: number | null
          region?: Database["public"]["Enums"]["tour_region"]
          seasonality?: string[]
          short_teaser?: string | null
          slug?: string
          source_summary?: string | null
          status?: Database["public"]["Enums"]["tour_status"]
          stops?: Json
          tags?: string[]
          time_type?: Database["public"]["Enums"]["tour_time_type"]
          title?: string
          updated_at?: string
          walking_level?: Database["public"]["Enums"]["tour_walking_level"]
          weather_fit?: string[]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_booking: {
        Args: { booking_row: Database["public"]["Tables"]["bookings"]["Row"] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      tour_category:
        | "Beach"
        | "Nature"
        | "Culture"
        | "Food"
        | "Family"
        | "Adventure"
      tour_difficulty: "Easy" | "Moderate"
      tour_region: "Chania" | "Rethymno" | "Heraklion" | "Lasithi"
      tour_status: "draft" | "published"
      tour_time_type: "Half day" | "Full day"
      tour_walking_level: "Low" | "Medium"
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
      app_role: ["admin", "user"],
      tour_category: [
        "Beach",
        "Nature",
        "Culture",
        "Food",
        "Family",
        "Adventure",
      ],
      tour_difficulty: ["Easy", "Moderate"],
      tour_region: ["Chania", "Rethymno", "Heraklion", "Lasithi"],
      tour_status: ["draft", "published"],
      tour_time_type: ["Half day", "Full day"],
      tour_walking_level: ["Low", "Medium"],
    },
  },
} as const
