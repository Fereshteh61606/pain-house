# Real-Time Chat Setup Guide

## Current Status
✅ Real-time subscriptions are configured
✅ Postgres changes listeners are set up
✅ Message deduplication is in place
✅ Auto-scroll on new messages
✅ Inactivity detection (5 minutes)

## Testing Real-Time Chat

### 1. Verify Supabase Configuration

Make sure you have `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Verify Database Setup

Run the SQL scripts in order:
```bash
# In your Supabase SQL Editor:
1. scripts/001_create_schema.sql
2. scripts/002_seed_default_rooms.sql
3. scripts/003_enable_realtime.sql
```

### 3. Check Real-Time is Enabled

In Supabase Dashboard:
- Go to Database → Replication
- Ensure `text_messages` table is enabled for real-time
- Ensure `room_participants` table is enabled for real-time

### 4. Test Real-Time Messaging

1. Open the app in two different browsers (or incognito + normal)
2. Join the same room in both browsers
3. Send a message from one browser
4. The message should appear INSTANTLY in the other browser without refresh

### 5. Check Browser Console

Open DevTools Console and look for these logs:
```
[TextChat] Setting up real-time subscription for room: xxx
[TextChat] Subscription status: SUBSCRIBED
[TextChat] Successfully subscribed to real-time messages
[TextChat] Real-time INSERT event received: {...}
[TextChat] Adding message to state: {...}
```

## Troubleshooting

### Messages not appearing instantly?

1. **Check Supabase Real-Time Status**
   - Dashboard → Settings → API
   - Ensure Real-Time is enabled

2. **Check Browser Console for Errors**
   - Look for subscription errors
   - Check network tab for WebSocket connections

3. **Verify Environment Variables**
   ```bash
   # Make sure these are set correctly
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Check Supabase Logs**
   - Dashboard → Logs → Real-Time Logs
   - Look for connection issues

5. **Restart Development Server**
   ```bash
   pnpm dev
   ```

### Still not working?

Check if the publication includes the table:
```sql
SELECT * FROM pg_publication_tables WHERE pubname='supabase_realtime';
```

Should show `text_messages` in the results.

## How It Works

1. **Client subscribes** to postgres_changes for `text_messages` table
2. **User sends message** → Inserted into database
3. **Postgres triggers** real-time event
4. **Supabase broadcasts** to all subscribed clients
5. **React component** receives event and updates state
6. **UI updates** instantly with new message

## Performance Notes

- Messages are deduplicated to prevent double-rendering
- Subscription is cleaned up when component unmounts
- Auto-scroll keeps latest messages visible
- Inactive users are removed after 5 minutes
