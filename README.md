# Safe Space - Anonymous Mental Health Support App

A compassionate, anonymous platform for mental health support featuring text and audio rooms, AI-powered insights, and bilingual support (English/Persian).

## Features

- **Complete Anonymity**: No personal information required. Users are identified only by participant numbers.
- **Support Rooms**: Multiple themed rooms for different mental health topics (depression, anxiety, trauma, addiction, etc.)
- **Text & Audio Chat**: Both text-based and Clubhouse-style audio rooms for different communication preferences.
- **Circle Visualization**: Beautiful visualization showing participants seated in a supportive circle with real-time activity indicators.
- **AI Mental Health Assistant**: GPT-4 powered analysis providing empathetic insights, coping strategies, and suggestions.
- **Bilingual**: Full support for English and Persian languages with easy switching.
- **Anti-Bot Protection**: Simple captcha verification to ensure a safe environment.
- **Real-time Updates**: Instant synchronization of messages, participants, and room activity.
- **Mobile-First Design**: Optimized for smartphones with user-friendly interface for all ages.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **AI**: Vercel AI SDK with OpenAI GPT-4
- **UI**: shadcn/ui components with Tailwind CSS
- **Styling**: Calming color palette based on psychological safety principles

## Getting Started

### Quick Start (5 minutes)

See **[QUICKSTART.md](QUICKSTART.md)** for detailed setup instructions.

**TL;DR:**
```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase and run database scripts
# - scripts/001_create_schema.sql
# - scripts/002_seed_default_rooms.sql
# - scripts/003_enable_realtime.sql

# 3. Configure environment
cp .env.example .env.local
# Add your Supabase credentials

# 4. Enable real-time in Supabase Dashboard
# Database → Replication → Enable text_messages & room_participants

# 5. Run the app
npm run dev
```

### Testing Real-Time Chat

**IMPORTANT:** To verify real-time messaging works:
1. Open TWO browser windows (normal + incognito)
2. Join the same room in both
3. Send a message from one window
4. It should appear INSTANTLY in the other (no refresh!)

See **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for comprehensive testing instructions.

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - How to test all features
- **[REALTIME_SETUP.md](REALTIME_SETUP.md)** - Real-time configuration details
- **[CHANGELOG.md](CHANGELOG.md)** - Recent changes and improvements

## Database Schema

- `rooms` - Support group rooms with bilingual names/descriptions
- `anonymous_sessions` - Anonymous user sessions (no personal data)
- `room_participants` - Tracks who's in which room with participant numbers
- `text_messages` - Text chat messages
- `audio_sessions` - Audio speaking sessions
- `ai_analyses` - AI-generated mental health insights

## Psychological Design Principles

- **Safety First**: Complete anonymity, no video, no personal data
- **Visual Comfort**: Warm, cozy color palette (terracotta, sage, cream), soft gradients, rounded corners
- **Connection**: Circle visualization creates sense of equality and community
- **Simplicity**: Large buttons, clear typography, easy navigation for all ages
- **Support**: AI assistant provides validation and professional suggestions
- **Real-Time Interaction**: Instant messaging creates sense of presence and connection
- **Inactivity Detection**: Automatic cleanup after 5 minutes ensures active participation

## Privacy & Security

- No personal information collected
- No profile pictures or real names
- Audio is not recorded
- All conversations are ephemeral
- Row Level Security on all database tables
- Anti-bot verification for new sessions

## License

Created with v0 by Vercel
