-- Create rooms table for support group rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fa TEXT NOT NULL, -- Persian translation
  description TEXT,
  description_fa TEXT, -- Persian translation
  room_type TEXT NOT NULL CHECK (room_type IN ('text', 'audio')),
  capacity INTEGER NOT NULL DEFAULT 30,
  is_ai_created BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create anonymous sessions table (no personal info)
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL, -- Random code for the session
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE -- For anti-bot verification
);

-- Create room participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
  participant_number INTEGER NOT NULL, -- 1 to room capacity
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(room_id, participant_number),
  UNIQUE(room_id, session_id)
);

-- Create text messages table
CREATE TABLE IF NOT EXISTS text_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES room_participants(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audio sessions table
CREATE TABLE IF NOT EXISTS audio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES room_participants(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_speaking BOOLEAN DEFAULT FALSE
);

-- Create AI analysis table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('realtime', 'summary')),
  content TEXT NOT NULL, -- AI analysis content
  mental_health_assessment TEXT, -- AI's assessment
  suggestions TEXT, -- AI's suggestions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read, AI can create)
CREATE POLICY "rooms_select_all" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert_anon" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update_anon" ON rooms FOR UPDATE USING (true);

-- RLS Policies for anonymous_sessions (users can only access their own)
CREATE POLICY "sessions_select_own" ON anonymous_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert_anon" ON anonymous_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_update_own" ON anonymous_sessions FOR UPDATE USING (true);

-- RLS Policies for room_participants (public read in rooms)
CREATE POLICY "participants_select_all" ON room_participants FOR SELECT USING (true);
CREATE POLICY "participants_insert_anon" ON room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_update_own" ON room_participants FOR UPDATE USING (true);
CREATE POLICY "participants_delete_own" ON room_participants FOR DELETE USING (true);

-- RLS Policies for text_messages (room members can read)
CREATE POLICY "messages_select_all" ON text_messages FOR SELECT USING (true);
CREATE POLICY "messages_insert_anon" ON text_messages FOR INSERT WITH CHECK (true);

-- RLS Policies for audio_sessions
CREATE POLICY "audio_select_all" ON audio_sessions FOR SELECT USING (true);
CREATE POLICY "audio_insert_anon" ON audio_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "audio_update_own" ON audio_sessions FOR UPDATE USING (true);

-- RLS Policies for ai_analyses (users can see their own)
CREATE POLICY "analyses_select_own" ON ai_analyses FOR SELECT USING (true);
CREATE POLICY "analyses_insert_anon" ON ai_analyses FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_room_participants_room ON room_participants(room_id);
CREATE INDEX idx_room_participants_session ON room_participants(session_id);
CREATE INDEX idx_text_messages_room ON text_messages(room_id);
CREATE INDEX idx_audio_sessions_room ON audio_sessions(room_id);
CREATE INDEX idx_ai_analyses_session ON ai_analyses(session_id);
