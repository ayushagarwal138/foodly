-- Add isRead field to chat_messages table
ALTER TABLE chat_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Update existing messages to be marked as read
UPDATE chat_messages SET is_read = TRUE;

-- Create index for better performance on unread message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_is_read ON chat_messages(sender, is_read); 