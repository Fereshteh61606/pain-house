# Quick Start Guide - Dard House (Pain House)

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for it to initialize (~2 minutes)

#### Run Database Scripts
In your Supabase SQL Editor, run these scripts in order:

1. **Create Schema** (`scripts/001_create_schema.sql`)
2. **Seed Rooms** (`scripts/002_seed_default_rooms.sql`)
3. **Enable Real-Time** (`scripts/003_enable_realtime.sql`)

#### Get Your Credentials
1. Go to Project Settings → API
2. Copy your:
   - Project URL
   - Anon/Public Key

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Enable Real-Time in Supabase Dashboard
1. Go to Database → Replication
2. Enable these tables:
   - ✅ `text_messages`
   - ✅ `room_participants`
   - ✅ `rooms`
   - ✅ `anonymous_sessions`

### 5. Run the App
```bash
npm run dev
```

Open http://localhost:3000

### 6. Test Real-Time Chat

**IMPORTANT:** To test real-time messaging properly:

1. Open **TWO browser windows:**
   - Window 1: Normal browser
   - Window 2: Incognito/Private mode

2. In **BOTH windows:**
   - Go to http://localhost:3000
   - Click on any room (e.g., "Depression Support")
   - Solve the CAPTCHA
   - Click "Join Room"

3. **Send a message** from Window 1
4. **Watch it appear INSTANTLY** in Window 2 (no refresh!)

✅ If messages appear instantly → Real-time is working!
❌ If you need to refresh → Check troubleshooting below

## 🔧 Troubleshooting

### Messages Not Appearing Instantly?

1. **Check Browser Console (F12)**
   - Look for: `[TextChat] Successfully subscribed to real-time messages`
   - If you see errors, check your Supabase credentials

2. **Verify Real-Time is Enabled**
   - Supabase Dashboard → Database → Replication
   - Ensure `text_messages` is checked

3. **Check Network Tab**
   - Look for WebSocket connection (ws:// or wss://)
   - Should show "101 Switching Protocols"

4. **Restart Dev Server**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

### CAPTCHA Not Working?
- Just solve the simple math equation (e.g., 5 + 3 = 8)

### Can't Join Room?
- Room might be full (check capacity)
- Make sure you completed CAPTCHA

## 📱 Features

### ✅ Real-Time Chat
- Messages appear instantly
- No page refresh needed
- Smooth animations

### ✅ Anonymity
- No login required
- No profile pictures
- Only participant numbers (#1, #2, etc.)
- Random avatars

### ✅ Bilingual
- English and Persian (Farsi)
- RTL support for Persian
- Toggle language anytime

### ✅ Safety Features
- CAPTCHA prevents bots
- Inactivity detection (5 min)
- Anonymous sessions
- No personal data collected

### ✅ Communication Modes
- Text chat
- Audio rooms (like Clubhouse)
- Choose your preferred mode

### ✅ Visual Feedback
- Circle visualization shows participants
- Animation when someone speaks
- Auto-scroll to latest messages

## 🎨 Theme

The app uses warm, cozy colors inspired by therapy rooms:
- Soft cream backgrounds
- Warm terracotta/coral accents
- Calming sage green highlights
- Comfortable, safe atmosphere

## 📚 Documentation

- **TESTING_GUIDE.md** - Comprehensive testing instructions
- **REALTIME_SETUP.md** - Real-time configuration details
- **CHANGELOG.md** - Recent changes and fixes

## 🆘 Need Help?

1. Check browser console for errors
2. Verify Supabase credentials
3. Ensure real-time is enabled
4. Check the troubleshooting guides

## 🎯 Success Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Database scripts run
- [ ] Environment variables set
- [ ] Real-time enabled in Supabase
- [ ] App running on localhost:3000
- [ ] Can join a room
- [ ] Messages appear instantly in two windows
- [ ] Animations work
- [ ] Language toggle works

If all checked ✅ - You're ready to go!
