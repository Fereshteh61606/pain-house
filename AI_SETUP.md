# AI Insights Setup

## What Changed

The AI insights feature has been completely redesigned to be minimal and non-intrusive.

### New Design
- **Tiny floating button** in the bottom-right corner (purple sparkle icon)
- Only appears when you're in a chat room
- Opens a beautiful modal when clicked
- No longer takes up space in the chat area

### How to Use
1. Join a room and send at least 3 messages
2. Click the purple sparkle button in the bottom-right
3. AI will analyze the conversation and provide:
   - Empathetic summary of emotional themes
   - Mental health insights
   - Practical coping suggestions
   - Encouragement and validation

### Setup Required

You need an OpenAI API key for this feature to work:

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env.local` file:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
4. Restart your development server

### Cost
- Uses GPT-4o-mini model (very affordable)
- Typical cost: ~$0.001 per analysis
- Only runs when user clicks the button

## Other Features Added

### 1. Participant Colors
Each participant now has a unique, consistent color:
- Blue, purple, pink, rose, orange, amber, lime, emerald, cyan, indigo
- Same color in chat bubbles, avatars, and circle visualization
- Makes it easy to follow who's saying what

### 2. Active Room Status
The home page now shows:
- **Active participant count**: "3/30" shows 3 people in a room with 30 capacity
- **Green "Active" badge**: Appears when people are in the room
- **Real-time updates**: Refreshes when people join/leave

This helps users find active conversations instead of empty rooms.
