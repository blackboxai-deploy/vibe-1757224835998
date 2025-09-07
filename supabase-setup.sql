-- House Inspection Management Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inspection_images ENABLE ROW LEVEL SECURITY;

-- Create houses table
CREATE TABLE IF NOT EXISTS houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  inspection_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create inspection_images table
CREATE TABLE IF NOT EXISTS inspection_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS houses_user_id_idx ON houses(user_id);
CREATE INDEX IF NOT EXISTS houses_created_at_idx ON houses(created_at DESC);

CREATE INDEX IF NOT EXISTS inspections_house_id_idx ON inspections(house_id);
CREATE INDEX IF NOT EXISTS inspections_user_id_idx ON inspections(user_id);
CREATE INDEX IF NOT EXISTS inspections_date_idx ON inspections(inspection_date DESC);

CREATE INDEX IF NOT EXISTS inspection_images_inspection_id_idx ON inspection_images(inspection_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_houses_updated_at 
    BEFORE UPDATE ON houses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at 
    BEFORE UPDATE ON inspections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for houses
CREATE POLICY "Users can view own houses" ON houses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own houses" ON houses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own houses" ON houses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own houses" ON houses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inspections
CREATE POLICY "Users can view own inspections" ON inspections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inspections" ON inspections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inspections" ON inspections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inspections" ON inspections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inspection_images
CREATE POLICY "Users can view images for own inspections" ON inspection_images FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_images.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create images for own inspections" ON inspection_images FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_images.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete images for own inspections" ON inspection_images FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_images.inspection_id 
    AND inspections.user_id = auth.uid()
  )
);

-- Create storage bucket for inspection images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspection-images', 'inspection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for inspection-images bucket
CREATE POLICY "Users can view images in inspection-images bucket" ON storage.objects FOR SELECT 
USING (bucket_id = 'inspection-images');

CREATE POLICY "Users can upload images to inspection-images bucket" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'inspection-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT inspections.id::text 
    FROM inspections 
    WHERE inspections.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own images from inspection-images bucket" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'inspection-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT inspections.id::text 
    FROM inspections 
    WHERE inspections.user_id = auth.uid()
  )
);