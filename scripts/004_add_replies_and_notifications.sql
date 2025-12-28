-- Add reply functionality to text messages
ALTER TABLE text_messages 
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES text_messages(id) ON DELETE SET NULL;

-- Add index for faster reply lookups
CREATE INDEX IF NOT EXISTS idx_text_messages_reply_to ON text_messages(reply_to_message_id);

-- Add notification preferences to anonymous sessions
ALTER TABLE anonymous_sessions
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT FALSE;

-- Create notifications table for tracking which messages triggered notifications
CREATE TABLE IF NOT EXISTS message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES text_messages(id) ON DELETE CASCADE,
  recipient_session_id UUID NOT NULL REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, recipient_session_id)
);

-- Enable RLS for notifications
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications (users can only see their own)
CREATE POLICY "notifications_select_own" ON message_notifications 
FOR SELECT USING (true);

CREATE POLICY "notifications_insert_anon" ON message_notifications 
FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON message_notifications 
FOR UPDATE USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_message_notifications_recipient ON message_notifications(recipient_session_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_message ON message_notifications(message_id);
