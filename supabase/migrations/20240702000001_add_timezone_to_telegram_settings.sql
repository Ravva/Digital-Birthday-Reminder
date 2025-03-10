-- Add timezone column to telegram_settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'telegram_settings' 
                AND column_name = 'timezone') THEN
    ALTER TABLE telegram_settings ADD COLUMN timezone TEXT DEFAULT 'GMT+3';
  END IF;
END $$;