-- Create telegram_settings table
CREATE TABLE IF NOT EXISTS telegram_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  bot_token TEXT,
  notification_time TIME DEFAULT '09:00:00',
  days_before INTEGER DEFAULT 0,
  message_template TEXT DEFAULT 'Today is {{name}}''s birthday!',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_telegram UNIQUE (user_id)
);

-- Enable row level security
ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own telegram settings
DROP POLICY IF EXISTS "Users can only access their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can only access their own telegram settings"
  ON telegram_settings
  USING (user_id = auth.uid());

-- Create policy for users to insert their own telegram settings
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can insert their own telegram settings"
  ON telegram_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create policy for users to update their own telegram settings
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can update their own telegram settings"
  ON telegram_settings
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create policy for users to delete their own telegram settings
DROP POLICY IF EXISTS "Users can delete their own telegram settings" ON telegram_settings;
CREATE POLICY "Users can delete their own telegram settings"
  ON telegram_settings
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime
alter publication supabase_realtime add table telegram_settings;