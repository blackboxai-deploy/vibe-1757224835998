-- Database Schema for House Inspection Management App
-- Execute these commands in your Supabase SQL editor

-- Create houses table
CREATE TABLE houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inspections table
CREATE TABLE inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  inspection_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Create policies for houses table
CREATE POLICY "Users can view their own houses" ON houses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own houses" ON houses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own houses" ON houses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own houses" ON houses
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for inspections table
CREATE POLICY "Users can view their own inspections" ON inspections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inspections" ON inspections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspections" ON inspections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspections" ON inspections
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for inspection images
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-images', 'inspection-images', true);

-- Create policies for storage bucket
CREATE POLICY "Users can view inspection images" ON storage.objects
  FOR SELECT USING (bucket_id = 'inspection-images');

CREATE POLICY "Authenticated users can upload inspection images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'inspection-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own inspection images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'inspection-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own inspection images" ON storage.objects
  FOR DELETE USING (bucket_id = 'inspection-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX houses_user_id_idx ON houses(user_id);
CREATE INDEX houses_created_at_idx ON houses(created_at DESC);

CREATE INDEX inspections_user_id_idx ON inspections(user_id);
CREATE INDEX inspections_house_id_idx ON inspections(house_id);
CREATE INDEX inspections_date_idx ON inspections(inspection_date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();