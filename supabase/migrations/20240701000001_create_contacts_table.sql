-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own contacts
DROP POLICY IF EXISTS "Users can only access their own contacts" ON contacts;
CREATE POLICY "Users can only access their own contacts"
  ON contacts
  USING (user_id = auth.uid());

-- Create policy for users to insert their own contacts
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
CREATE POLICY "Users can insert their own contacts"
  ON contacts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create policy for users to update their own contacts
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
CREATE POLICY "Users can update their own contacts"
  ON contacts
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create policy for users to delete their own contacts
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;
CREATE POLICY "Users can delete their own contacts"
  ON contacts
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime
alter publication supabase_realtime add table contacts;