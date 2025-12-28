# 🚀 Deployment Guide - Pain House

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)
### Option 2: Netlify
### Option 3: Your Own Server

---

## 📦 Option 1: Deploy to Vercel (5 minutes)

Vercel is the easiest and free option for Next.js apps.

### Step 1: Prepare Your Code

1. **Make sure your code is on GitHub:**
   ```bash
   # Initialize git if you haven't
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit"
   
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/pain-house.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** (use your GitHub account)
3. Click **"Add New Project"**
4. **Import** your GitHub repository
5. Vercel will auto-detect it's a Next.js app
6. Click **"Deploy"**

### Step 3: Add Environment Variables

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```
4. Click **"Save"**
5. Go to **"Deployments"** → Click **"Redeploy"**

### Step 4: Done! 🎉

Your app is now live at: `https://your-project-name.vercel.app`

---

## 📦 Option 2: Deploy to Netlify

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify

1. Go to https://netlify.com
2. Click **"Sign Up"** (use GitHub)
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub** and select your repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Click **"Deploy site"**

### Step 3: Add Environment Variables

1. Go to **"Site settings"** → **"Environment variables"**
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```
3. Click **"Save"**
4. Go to **"Deploys"** → **"Trigger deploy"**

---

## 📦 Option 3: Deploy to Your Own Server

### Requirements:
- Ubuntu/Debian server
- Node.js 18+ installed
- Domain name (optional)

### Step 1: Install Node.js on Server

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 2: Upload Your Code

```bash
# On your local machine, create a zip
zip -r pain-house.zip . -x "node_modules/*" ".next/*" ".git/*"

# Upload to server
scp pain-house.zip user@your-server-ip:/home/user/

# On server, extract
cd /home/user
unzip pain-house.zip -d pain-house
cd pain-house
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Create Environment File

```bash
nano .env.local
```

Add:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Save (Ctrl+X, Y, Enter)

### Step 5: Build the App

```bash
npm run build
```

### Step 6: Run with PM2 (Process Manager)

```bash
# Install PM2
sudo npm install -g pm2

# Start the app
pm2 start npm --name "pain-house" -- start

# Make it start on server reboot
pm2 startup
pm2 save
```

### Step 7: Set Up Nginx (Optional - for custom domain)

```bash
# Install Nginx
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/pain-house
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pain-house /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Add SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🗄️ Database Setup (Required for All Options)

### You've already done this if you followed SETUP_NOW.md

If not:

1. Go to https://supabase.com/dashboard
2. Open your project
3. Go to **SQL Editor**
4. Run these scripts in order:
   - `scripts/001_create_schema.sql`
   - `scripts/002_seed_default_rooms.sql`
   - `scripts/003_enable_realtime.sql`
5. Go to **Database** → **Replication**
6. Enable real-time for:
   - text_messages
   - room_participants
   - rooms
   - anonymous_sessions

---

## 📱 Mobile App Deployment (Android)

### Option A: Progressive Web App (PWA) - Easiest

Your app is already mobile-friendly! Users can:
1. Open your website on their phone
2. Click browser menu → **"Add to Home Screen"**
3. App icon appears on home screen
4. Works like a native app!

### Option B: Build Native Android App

1. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **Add Android platform:**
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

3. **Build and sync:**
   ```bash
   npm run build
   npx cap sync
   ```

4. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

5. **Build APK** in Android Studio

6. **Upload to Google Play Store**

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at your URL
- [ ] Environment variables are set
- [ ] Database scripts have been run
- [ ] Real-time is enabled in Supabase
- [ ] Can create an account (anonymous session)
- [ ] Can join a room
- [ ] Can send messages (appear instantly)
- [ ] Can create new rooms
- [ ] Both languages work (EN/FA)
- [ ] Mobile responsive

---

## 🔧 Troubleshooting

### "Failed to fetch rooms"
→ Check environment variables are set correctly

### "Messages not appearing instantly"
→ Enable real-time in Supabase Dashboard → Database → Replication

### "Can't join room"
→ Run database scripts in Supabase SQL Editor

### Build fails
→ Run `npm install` again
→ Check Node.js version (needs 18+)

---

## 📊 Monitoring Your App

### Vercel:
- Dashboard shows analytics
- Real-time logs
- Performance metrics

### Your Own Server:
```bash
# View logs
pm2 logs pain-house

# Check status
pm2 status

# Restart app
pm2 restart pain-house
```

---

## 💰 Costs

### Free Tier (Good for testing):
- **Vercel:** Free (500GB bandwidth/month)
- **Supabase:** Free (500MB database, 2GB bandwidth)
- **Total:** $0/month

### Production (Recommended):
- **Vercel Pro:** $20/month (unlimited bandwidth)
- **Supabase Pro:** $25/month (8GB database, 50GB bandwidth)
- **Total:** $45/month

### Your Own Server:
- **VPS (DigitalOcean/Linode):** $5-10/month
- **Supabase:** $25/month
- **Total:** $30-35/month

---

## 🚀 Quick Deploy Commands

```bash
# For Vercel (after connecting GitHub)
vercel

# For your own server
npm run build
pm2 start npm --name "pain-house" -- start

# Check if it's running
curl http://localhost:3000
```

---

## 📞 Need Help?

1. Check the logs (Vercel dashboard or `pm2 logs`)
2. Verify environment variables
3. Test database connection at `/test-connection`
4. Check Supabase logs

---

## 🎉 You're Done!

Your Pain House app is now live and helping people! 

Share your URL with users and watch your community grow.
