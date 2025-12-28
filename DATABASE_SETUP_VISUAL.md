# 📊 Visual Database Setup Guide

## Current Status: ❌ Database Not Set Up

Your app is trying to fetch rooms from the database, but the tables don't exist yet.

---

## 🎯 What You Need To Do

### 1️⃣ Open Supabase Dashboard

```
https://supabase.com/dashboard
```

Click on your project → Click "SQL Editor" in left menu

---

### 2️⃣ Run These 3 Scripts (In Order!)

#### Script 1: Create Tables
📁 File: `scripts/001_create_schema.sql`

This creates:
- ✅ rooms table
- ✅ anonymous_sessions table
- ✅ room_participants table
- ✅ text_messages table
- ✅ audio_sessions table
- ✅ ai_analyses table

**How to run:**
1. Open `scripts/001_create_schema.sql` in your editor
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. In Supabase SQL Editor, click "New query"
4. Paste the content (Ctrl+V)
5. Click "Run" button
6. Wait for "Success" message

---

#### Script 2: Add Default Rooms
📁 File: `scripts/002_seed_default_rooms.sql`

This adds 7 default rooms:
- Depression Support
- Anxiety Relief
- Grief & Loss
- Trauma Recovery
- Addiction Support
- Self-Harm Recovery
- Eating Disorders

**How to run:**
1. Open `scripts/002_seed_default_rooms.sql`
2. Copy ALL the content
3. In Supabase SQL Editor, click "New query"
4. Paste the content
5. Click "Run"
6. You should see "Success. 7 rows returned"

---

#### Script 3: Enable Real-Time
📁 File: `scripts/003_enable_realtime.sql`

This enables instant messaging.

**How to run:**
1. Open `scripts/003_enable_realtime.sql`
2. Copy ALL the content
3. In Supabase SQL Editor, click "New query"
4. Paste the content
5. Click "Run"
6. Wait for "Success"

---

### 3️⃣ Enable Real-Time in UI

1. In Supabase dashboard, go to **Database** → **Replication**
2. You'll see a list of tables
3. Check the box next to these tables:
   - ✅ text_messages
   - ✅ room_participants
   - ✅ rooms
   - ✅ anonymous_sessions

---

### 4️⃣ Verify Setup

Run this query in SQL Editor to check:

```sql
SELECT COUNT(*) as room_count FROM rooms;
```

You should see: `room_count: 7`

---

## 🔧 Troubleshooting

### Error: "relation 'rooms' does not exist"
→ You haven't run Script 1 yet. Run `001_create_schema.sql`

### Error: "Failed to fetch rooms: {}"
→ Either:
   - Tables don't exist (run Script 1)
   - Wrong Supabase credentials in `.env.local`

### No rooms showing on home page
→ Run Script 2 to add default rooms

### Messages not appearing instantly
→ Run Script 3 and enable real-time in Database → Replication

---

## ✅ After Setup

Once all scripts are run, your app will:
- ✅ Show 7 default rooms on home page
- ✅ Allow users to join rooms
- ✅ Enable instant messaging (real-time)
- ✅ Allow users to create their own rooms
- ✅ Track participants with numbers
- ✅ Provide AI insights

---

## 🆘 Still Stuck?

1. Check `.env.local` has real Supabase credentials
2. Restart dev server: `npm run dev`
3. Clear browser cache and refresh
4. Check Supabase logs: Dashboard → Logs

---

## 📝 Quick Copy-Paste Commands

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check if rooms were added:
```sql
SELECT name, name_fa, room_type, capacity FROM rooms;
```

### Check real-time status:
```sql
SELECT * FROM pg_publication_tables WHERE pubname='supabase_realtime';
```
