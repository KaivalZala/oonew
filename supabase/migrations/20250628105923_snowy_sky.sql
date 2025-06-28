/*
  # Create menu_items table

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key, auto-generated)
      - `name` (text, required) - Name of the menu item
      - `description` (text, required) - Description of the menu item
      - `category` (text, required) - Category like "Main Course", "Appetizer", etc.
      - `price` (numeric(10,2), required) - Price with 2 decimal places
      - `image_url` (text, optional) - URL to item image
      - `available` (boolean, default true) - Whether item is available for ordering
      - `created_at` (timestamptz, auto-generated) - Creation timestamp
      - `updated_at` (timestamptz, auto-generated) - Last update timestamp

  2. Security
    - Enable RLS on `menu_items` table
    - Add policy for anonymous users to read menu items
    - Add policy for authenticated users to manage menu items

  3. Triggers
    - Add trigger to automatically update `updated_at` column
*/

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read menu items"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();