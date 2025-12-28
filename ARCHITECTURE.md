# Architecture Overview - Dard House

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js 16)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Home Page  │  │  Room Page   │  │  Components  │     │
│  │              │  │              │  │              │     │
│  │ - Room List  │  │ - Circle Viz │  │ - TextChat   │     │
│  │ - Language   │  │ - Text Chat  │  │ - AudioChat  │     │
│  │   Toggle     │  │ - Audio Chat │  │ - AIInsights │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ WebSocket + HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │                                                       │  │
│  │  • rooms                                             │  │
│  │  • anonymous_sessions                                │  │
│  │  • room_participants                                 │  │
│  │  • text_messages                                     │  │
│  │  • audio_sessions                                    │  │
│  │  • ai_analyses                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Real-Time Engine                         │  │
│  │                                                       │  │
│  │  • WebSocket connections                             │  │
│  │  • Postgres change listeners                         │  │
│  │  • Broadcast to subscribers                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Row Level Security                       │  │
│  │                                                       │  │
│  │  • Public read access                                │  │
│  │  • Authenticated write access                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI Services                             │
│                   (OpenAI GPT-4)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • Analyze conversation patterns                            │
│  • Provide mental health insights                           │
│  • Suggest coping strategies                                │
│  • Generate empathetic responses                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Real-Time Message Flow

```
User A (Browser 1)                    Supabase                    User B (Browser 2)
      │                                  │                               │
      │  1. Type message                 │                               │
      │     "I'm feeling anxious"        │                               │
      │                                  │                               │
      │  2. Click Send                   │                               │
      ├─────────────────────────────────>│                               │
      │     POST /text_messages          │                               │
      │                                  │                               │
      │                                  │  3. Insert into DB            │
      │                                  │     (text_messages table)     │
      │                                  │                               │
      │                                  │  4. Trigger postgres_changes  │
      │                                  │     event                     │
      │                                  │                               │
      │  5. Receive via WebSocket        │  6. Broadcast to all          │
      │<─────────────────────────────────┤     subscribers               │
      │     (own message)                ├──────────────────────────────>│
      │                                  │     (WebSocket)               │
      │                                  │                               │
      │  7. Update React state           │                               │  8. Update React state
      │     setMessages([...prev, new])  │                               │     setMessages([...prev, new])
      │                                  │                               │
      │  9. UI re-renders                │                               │  10. UI re-renders
      │     Message appears instantly    │                               │      Message appears instantly
      │                                  │                               │
      │  11. Trigger animation           │                               │  12. Trigger animation
      │      (speaker indicator)         │                               │      (speaker indicator)
      │                                  │                               │
```

## Component Hierarchy

```
RoomClient (room-client.tsx)
│
├─── CircleVisualization
│    └─── Shows participants in circle
│         Animates when someone speaks
│
├─── Tabs (Text/Audio)
│    │
│    ├─── TextChat
│    │    ├─── AIInsights
│    │    │    └─── Analyzes messages
│    │    │         Provides suggestions
│    │    │
│    │    ├─── ScrollArea (messages)
│    │    │    └─── Message bubbles
│    │    │         Participant numbers
│    │    │         Timestamps
│    │    │
│    │    └─── Input + Send button
│    │
│    └─── AudioChat
│         └─── Audio controls
│              Participant list
│              Speaking indicators
│
└─── CaptchaVerification (modal)
     └─── Simple math problem
          Prevents bots
```

## Data Flow

### 1. User Joins Room

```
1. User visits /room/[id]
2. RoomClient loads room data (SSR)
3. Check for existing session (localStorage)
4. If no session → Create anonymous session
5. Show CAPTCHA verification
6. User solves CAPTCHA
7. Mark session as verified
8. Call joinRoom() server action
9. Insert into room_participants
10. Assign participant number (1-30)
11. Real-time broadcast to all users
12. Update circle visualization
```

### 2. User Sends Message

```
1. User types in input field
2. Press Enter or click Send
3. Call sendMessage() server action
4. Insert into text_messages table
5. Postgres triggers INSERT event
6. Supabase broadcasts to subscribers
7. All connected clients receive event
8. Fetch full message with participant info
9. Update local state (deduplicate)
10. UI re-renders with new message
11. Auto-scroll to bottom
12. Trigger speaker animation
```

### 3. User Becomes Inactive

```
1. User stops interacting (no mouse/keyboard/scroll)
2. Inactivity timer starts (5 minutes)
3. Timer resets on any activity
4. After 5 minutes → Call leaveRoom()
5. Delete from room_participants
6. Real-time broadcast to all users
7. Update circle visualization
8. Remove from participant list
```

## Security Model

### Row Level Security (RLS)

```sql
-- All tables have RLS enabled

-- Example: text_messages
CREATE POLICY "Anyone can read messages"
  ON text_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON text_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
```

### Anonymity Protection

- No user accounts or authentication
- No personal data collected
- No IP logging
- No message history beyond session
- Participant numbers reset per room
- Sessions expire after inactivity

## Performance Optimizations

### 1. Real-Time Subscriptions
- Single WebSocket connection per client
- Filtered by room_id (only relevant messages)
- Automatic reconnection on disconnect
- Cleanup on component unmount

### 2. Message Rendering
- Deduplication prevents double-rendering
- Virtual scrolling for large message lists
- Optimistic UI updates
- Lazy loading of AI insights

### 3. Database Queries
- Indexed on room_id and created_at
- Efficient joins with participant data
- Pagination for message history
- Caching of room metadata

## Scalability Considerations

### Current Limits
- 30 participants per room (configurable)
- Unlimited rooms
- Unlimited messages (ephemeral)
- 5-minute inactivity timeout

### Scaling Strategy
1. **Horizontal Scaling**: Add more Next.js instances
2. **Database**: Supabase handles scaling automatically
3. **Real-Time**: Supabase manages WebSocket connections
4. **CDN**: Static assets served via Vercel Edge Network
5. **AI**: Rate limiting on AI analysis calls

## Monitoring & Debugging

### Console Logs
- `[TextChat]` - Message subscription and handling
- `[RoomClient]` - Participant management
- `[AudioChat]` - Audio session handling

### Supabase Dashboard
- Real-Time Logs: Monitor WebSocket connections
- Database Logs: Track queries and performance
- API Logs: Monitor request patterns

### Browser DevTools
- Network Tab: Check WebSocket status
- Console: View real-time events
- React DevTools: Inspect component state
