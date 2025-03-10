-- Add timezone column to telegram_settings table
ALTER TABLE telegram_settings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'GMT+3';
