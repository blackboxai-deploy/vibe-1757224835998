# Database Setup Guide - Supabase Configuration

This guide will help you set up the Supabase database for the House Inspection Management App.

## Prerequisites

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard
3. Get your project URL and API keys from the project settings

## Environment Variables

Update your `.env.local` file with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Schema

Run the following SQL commands in your Supabase SQL Editor:

### 1. Create Houses Table

```sql
-- Create houses table
CREATE TABLE IF NOT EXISTS public.houses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS houses_user_id_idx ON public.houses(user_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS houses_created_at_idx ON public.houses(created_at DESC);
```

### 2. Create Inspections Table

```sql
-- Create inspections table
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    house_id UUID REFERENCES public.houses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS inspections_user_id_idx ON public.inspections(user_id);
CREATE INDEX IF NOT EXISTS inspections_house_id_idx ON public.inspections(house_id);
CREATE INDEX IF NOT EXISTS inspections_inspection_date_idx ON public.inspections(inspection_date DESC);
CREATE INDEX IF NOT EXISTS inspections_created_at_idx ON public.inspections(created_at DESC);
```

### 3. Create Updated At Trigger Function

```sql
-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for houses table
CREATE TRIGGER handle_houses_updated_at
    BEFORE UPDATE ON public.houses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create triggers for inspections table
CREATE TRIGGER handle_inspections_updated_at
    BEFORE UPDATE ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

## Row Level Security (RLS)

Enable RLS and create policies to secure your data:

### 1. Enable RLS

```sql
-- Enable RLS on houses table
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inspections table
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
```

### 2. Create RLS Policies

```sql
-- Houses table policies
CREATE POLICY "Users can view their own houses" ON public.houses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own houses" ON public.houses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own houses" ON public.houses
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own houses" ON public.houses
    FOR DELETE USING (auth.uid() = user_id);

-- Inspections table policies
CREATE POLICY "Users can view their own inspections" ON public.inspections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inspections" ON public.inspections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspections" ON public.inspections
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspections" ON public.inspections
    FOR DELETE USING (auth.uid() = user_id);
```

## Storage Setup

### 1. Create Storage Bucket

Go to Storage in your Supabase dashboard and create a new bucket:

- Bucket name: `inspection-images`
- Public: `true` (for public read access to images)

### 2. Storage RLS Policies

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Users can upload inspection images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'inspection-images' 
        AND auth.role() = 'authenticated'
    );

-- Allow public read access to images
CREATE POLICY "Public can view inspection images" ON storage.objects
    FOR SELECT USING (bucket_id = 'inspection-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own inspection images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'inspection-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own inspection images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'inspection-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

## Verification

To verify your setup is working correctly:

### 1. Test Database Connection

```sql
-- Run this query to test the setup
SELECT 
    t.table_name,
    t.is_insertable_into,
    p.policy_name
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name
WHERE t.table_schema = 'public' 
    AND t.table_name IN ('houses', 'inspections');
```

### 2. Test RLS Policies

After signing up a user through your app:

```sql
-- This should work when authenticated
SELECT * FROM public.houses WHERE user_id = auth.uid();

-- This should work when authenticated
SELECT * FROM public.inspections WHERE user_id = auth.uid();
```

## Sample Data (Optional)

You can insert some test data to verify everything is working:

```sql
-- Insert a test house (replace 'user-uuid' with actual user ID from auth.users)
INSERT INTO public.houses (user_id, name, address) VALUES
('user-uuid-here', 'Sample House', '123 Main Street, City, State 12345');

-- Insert a test inspection
INSERT INTO public.inspections (house_id, user_id, title, notes, inspection_date) VALUES
('house-uuid-here', 'user-uuid-here', 'Initial Inspection', 'Everything looks good!', '2024-01-15T10:00:00Z');
```

## Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Make sure you're authenticated when testing queries
2. **Foreign Key Errors**: Ensure user exists in auth.users before inserting data
3. **Storage Upload Fails**: Check bucket permissions and RLS policies
4. **Connection Issues**: Verify your environment variables are correct

### Useful Debug Queries:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('houses', 'inspections');

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename IN ('houses', 'inspections');

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'inspection-images';
```

## Next Steps

Once your database is set up:

1. Update your `.env.local` file with the correct values
2. Test the authentication flow by signing up a new user
3. Try creating a house and inspection through the app interface
4. Test image upload functionality

Your House Inspection Management App is now ready to use! 🎉