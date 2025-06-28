import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  table_number: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  customer_notes?: string;
  created_at: string;
  updated_at: string;
}