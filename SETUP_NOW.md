# 🚀 QUICK SETUP - Do This Now!

## Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Click **"SQL Editor"** in the left sidebar

## Step 2: Run Script 1 - Create Tables

1. Click **"New query"**
2. Copy ALL the text from `scripts/001_create_schema.sql`
3. Paste it into the SQL editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for "Success. No rows returned"

## Step 3: Run Script 2 - Add Default Rooms

1. Click **"New query"** again
2. Copy ALL the text from `scripts/002_seed_default_rooms.sql`
3. Paste it into the SQL editor
4. Click **"Run"**
5. You should see "Success. 7 rows returned" or similar

## Step 4: Run Script 3 - Enable Real-Time

1. Click **"New query"** again
2. Copy ALL the text from `scripts/003_enable_realtime.sql`
3. Paste it into the SQL editor
4. Click **"Run"**
5. Wait for success message

## Step 5: Enable Real-Time in Dashboard

1. Go to **Database** → **Replication** (in left sidebar)
2. Find these tables and check the box next to each:
   - ✅ `text_messages`
   - ✅ `room_participants`
   - ✅ `rooms`
   - ✅ `anonymous_sessions`
   - ✅ `audio_sessions`
   - ✅ `ai_analyses`

## Step 6: Refresh Your App

Go back to http://localhost:3000 and refresh the page.

You should now see the default rooms!

---

## ⚠️ Still Getting Errors?

### Check Your .env.local File

Make sure it has REAL values (not placeholders):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy **Project URL**
3. Copy **anon public** key (under Project API keys)
4. Paste them into `.env.local`
5. Restart your dev server:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

## 🎉 Success Checklist

- [ ] Supabase project created
- [ ] `.env.local` has real credentials
- [ ] Script 1 (create schema) ran successfully
- [ ] Script 2 (seed rooms) ran successfully
- [ ] Script 3 (enable realtime) ran successfully
- [ ] Real-time enabled in Database → Replication
- [ ] Dev server restarted
- [ ] App shows rooms on home page

Once all checked, your app is ready! 🚀
