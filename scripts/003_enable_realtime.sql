-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE anonymous_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE text_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE audio_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_analyses;

-- Verify tables are in publication
SELECT * FROM pg_publication_tables WHERE pubname='supabase_realtime';

-- Enable replica identity for DELETE events to work properly
ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE anonymous_sessions REPLICA IDENTITY FULL;
ALTER TABLE room_participants REPLICA IDENTITY FULL;
ALTER TABLE text_messages REPLICA IDENTITY FULL;
ALTER TABLE audio_sessions REPLICA IDENTITY FULL;
ALTER TABLE ai_analyses REPLICA IDENTITY FULL;
