export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      houses: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "houses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      inspections: {
        Row: {
          id: string
          house_id: string
          user_id: string
          title: string
          notes: string | null
          inspection_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          house_id: string
          user_id: string
          title: string
          notes?: string | null
          inspection_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          house_id?: string
          user_id?: string
          title?: string
          notes?: string | null
          inspection_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type House = Database['public']['Tables']['houses']['Row']
export type NewHouse = Database['public']['Tables']['houses']['Insert']
export type UpdateHouse = Database['public']['Tables']['houses']['Update']

export type Inspection = Database['public']['Tables']['inspections']['Row']
export type NewInspection = Database['public']['Tables']['inspections']['Insert']
export type UpdateInspection = Database['public']['Tables']['inspections']['Update']

// Extended types with relationships
export type HouseWithInspections = House & {
  inspections: Inspection[]
}

export type InspectionWithHouse = Inspection & {
  house: House
}

// Image upload types
export interface UploadedImage {
  id: string
  url: string
  path: string
  inspection_id: string
  created_at: string
}