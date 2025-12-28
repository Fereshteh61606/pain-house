# Message Replies & Notifications Setup

## New Features Added

### 1. Message Replies
Users can now reply to specific messages in the chat:

**How to use:**
- Hover over any message (not your own)
- Click the small reply icon that appears
- Type your reply and send
- The reply will show which message you're responding to

**Features:**
- Reply preview shows in the message bubble
- Clear visual indication of reply context
- Press ESC to cancel a reply
- Works seamlessly with the existing chat

### 2. Browser Notifications
Users get notified when they receive new messages:

**How to enable:**
1. Click the bell icon in the chat input area
2. Browser will ask for notification permission
3. Allow notifications
4. You'll now get notified of:
   - New messages in the room
   - Replies to your messages

**Features:**
- Bell icon shows if notifications are enabled (colored) or disabled (gray)
- Notifications only show for other people's messages (not your own)
- Works even when the tab is in the background
- Notification shows participant number and message preview

## Database Setup

Run the new migration script to add reply and notification support:

```bash
# Connect to your Supabase project and run:
psql -h your-supabase-host -U postgres -d postgres -f scripts/004_add_replies_and_notifications.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `scripts/004_add_replies_and_notifications.sql`
3. Run the script

## What Changed in the Database

### New Columns:
- `text_messages.reply_to_message_id` - Links a message to the one it's replying to
- `anonymous_sessions.notifications_enabled` - Stores user's notification preference

### New Table:
- `message_notifications` - Tracks which notifications were sent (for future features)

## User Experience

### Reply Flow:
1. User hovers over a message
2. Reply button appears
3. Click reply → message preview shows at bottom
4. Type reply → send
5. Reply shows with context of original message

### Notification Flow:
1. User enables notifications (one-time permission)
2. When someone sends a message:
   - If user is in another tab → Browser notification
   - If user is viewing the chat → Just see the message
3. Notification shows:
   - Participant number
   - Message preview (first 100 characters)
   - Room name

## Privacy & Safety

- **Anonymous**: Notifications don't reveal real identities
- **Participant numbers only**: Shows "#3 replied to you"
- **No personal data**: No names, emails, or profiles
- **User controlled**: Users can enable/disable anytime
- **Secure**: All data stays in Supabase with RLS policies

## Technical Details

### Reply Implementation:
- Uses foreign key to link messages
- Fetches reply context with nested query
- Shows reply preview in message bubble
- Maintains message threading

### Notification Implementation:
- Uses browser Notification API
- Requests permission once
- Stores preference in database
- Only notifies for relevant messages
- Includes message preview and context

## Testing

1. **Test Replies:**
   - Open two browser windows (or incognito)
   - Join same room as different participants
   - Send message from one
   - Reply from the other
   - Verify reply shows context

2. **Test Notifications:**
   - Enable notifications in one window
   - Send message from another window
   - Verify notification appears
   - Check notification content is correct

## Browser Compatibility

Notifications work in:
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop & iOS 16.4+)
- ❌ iOS Safari (older versions)

## Future Enhancements

Possible additions:
- Notification sound
- Unread message count
- Notification history
- Reply threads (nested replies)
- Mention system (@participant)
