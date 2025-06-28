/*
  # Restaurant System Database Schema

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `price` (numeric)
      - `image_url` (text, optional)
      - `available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `table_number` (integer)
      - `items` (jsonb)
      - `total` (numeric)
      - `status` (text)
      - `customer_notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for menu_items
    - Authenticated access for orders management
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  customer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for menu_items (public read, authenticated write)
CREATE POLICY "Anyone can read menu items"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for orders (public insert, authenticated manage)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample menu items
INSERT INTO menu_items (name, description, category, price, available) VALUES
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 'Main Course', 280.00, true),
  ('Paneer Tikka', 'Grilled cottage cheese marinated in spices', 'Vegetarian', 320.00, true),
  ('Biryani', 'Fragrant basmati rice with aromatic spices and meat', 'Main Course', 350.00, true),
  ('Dal Tadka', 'Yellow lentils tempered with cumin and garlic', 'Vegetarian', 180.00, true),
  ('Naan', 'Soft wheat flatbread baked in tandoor', 'Bread', 60.00, true),
  ('Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 'Dessert', 120.00, true),
  ('Masala Chai', 'Spiced tea with milk and aromatic herbs', 'Beverage', 40.00, true),
  ('Chicken Tikka', 'Grilled chicken marinated in yogurt and spices', 'Appetizer', 300.00, true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();