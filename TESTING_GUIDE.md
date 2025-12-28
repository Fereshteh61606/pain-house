# Testing Guide for Dard House

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Testing Real-Time Chat (CRITICAL)

### Setup for Testing

1. **Open TWO browser windows:**
   - Window 1: Normal browser (e.g., Chrome)
   - Window 2: Incognito/Private mode OR different browser (e.g., Firefox)

2. **In BOTH windows:**
   - Navigate to http://localhost:3000
   - Click on any room (e.g., "Depression Support")
   - Complete the CAPTCHA verification
   - Click "Join Room"

### Test Scenarios

#### ✅ Test 1: Instant Message Delivery
1. In Window 1: Type a message and send
2. In Window 2: Message should appear INSTANTLY (no refresh needed)
3. In Window 1: You should see your own message immediately

**Expected:** Messages appear in real-time in both windows

#### ✅ Test 2: Multiple Messages
1. Send 3-4 messages rapidly from Window 1
2. All messages should appear in Window 2 in order
3. No duplicates should appear

**Expected:** All messages delivered in order, no duplicates

#### ✅ Test 3: Bidirectional Chat
1. Send message from Window 1
2. Send message from Window 2
3. Both should see each other's messages instantly

**Expected:** Full two-way communication works

#### ✅ Test 4: Participant Numbers
1. Check participant number in Window 1 (e.g., #1)
2. Check participant number in Window 2 (e.g., #2)
3. Messages should show correct participant numbers

**Expected:** Each user has unique number, messages show sender number

#### ✅ Test 5: Animation
1. Send message from Window 1
2. In Window 2: The circle visualization should show participant #1 "speaking"
3. Animation should last ~2.5 seconds

**Expected:** Visual feedback when someone sends a message

#### ✅ Test 6: Inactivity Detection
1. Join a room
2. Don't interact for 5 minutes
3. User should be automatically removed from room

**Expected:** Inactive users are cleaned up

### Debugging Real-Time Issues

If messages are NOT appearing instantly:

1. **Open Browser Console (F12)**
   - Look for `[TextChat]` logs
   - Should see: "Successfully subscribed to real-time messages"
   - Should see: "Real-time INSERT event received" when messages sent

2. **Check Network Tab**
   - Look for WebSocket connection to Supabase
   - Should show "ws://" or "wss://" connection
   - Status should be "101 Switching Protocols"

3. **Verify Supabase Setup**
   - Go to Supabase Dashboard
   - Database → Replication
   - Ensure `text_messages` is checked
   - Ensure `room_participants` is checked

4. **Check Environment Variables**
   ```bash
   # In terminal where you run pnpm dev
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

## Testing Other Features

### Chat UI Improvements
- ✅ Compact, handy chat container
- ✅ Smooth animations for new messages
- ✅ Auto-scroll to latest message
- ✅ Responsive design
- ✅ Clear participant identification (#1, #2, etc.)

### Inactivity Detection
- ✅ Users removed after 5 minutes of no activity
- ✅ Activity tracked: mouse, keyboard, scroll, touch

### Anonymity
- ✅ No profile pictures
- ✅ Only participant numbers visible
- ✅ Random avatar assignment
- ✅ No personal information required

### Bilingual Support
- ✅ English and Persian (Farsi)
- ✅ RTL support for Persian
- ✅ Language toggle button

## Common Issues

### Issue: "Failed to send message"
**Solution:** Check Supabase credentials in .env.local

### Issue: Messages require page refresh
**Solution:** 
1. Check browser console for subscription errors
2. Verify real-time is enabled in Supabase
3. Run scripts/003_enable_realtime.sql

### Issue: Participant number not showing
**Solution:** Ensure you've joined the room (not just viewing)

### Issue: CAPTCHA not working
**Solution:** This is a simple math CAPTCHA, just solve the equation

## Performance Expectations

- **Message delivery:** < 100ms
- **UI update:** Instant (React state update)
- **Animation:** Smooth 60fps
- **Memory:** Efficient (messages deduplicated)
- **Cleanup:** Automatic on component unmount

## Success Criteria

✅ Messages appear instantly without refresh
✅ No duplicate messages
✅ Participant numbers are unique and consistent
✅ Animations work smoothly
✅ Inactive users are removed
✅ UI is responsive and user-friendly
✅ Both languages work correctly
✅ CAPTCHA prevents bots
