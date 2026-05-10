# 📋 Complete Setup Guide — NetOps AI Copilot

This guide walks you through every single step from zero to running the project locally and deploying it live.

---

## ✅ STEP 1: Install Prerequisites

### Install Node.js (v20 LTS recommended)
- Download from: https://nodejs.org/en/download
- After installing, verify:
```bash
node --version   # Should show v18+ or v20+
npm --version    # Should show v9+
```

### Install Git
- Download from: https://git-scm.com/downloads
- Or on macOS: `brew install git`

---

## ✅ STEP 2: Get the Project

### Option A — From the ZIP file (if you have the zip)
1. Extract the ZIP file
2. Open terminal inside the extracted folder
3. Continue to Step 3

### Option B — From GitHub
```bash
git clone https://github.com/YOUR_USERNAME/netops-ai-copilot.git
cd netops-ai-copilot
```

---

## ✅ STEP 3: Install Node Modules

```bash
npm install
```

This downloads all packages (~300MB, takes 1-2 min). You'll see a `node_modules/` folder appear.

---

## ✅ STEP 4: Create MongoDB Database (FREE)

1. Go to **https://cloud.mongodb.com**
2. Sign up for a free account
3. Click **"Build a Database"** → Choose **M0 FREE** tier → Select any cloud region → Click **Create**
4. **Set up authentication:**
   - Username: `netops_user`
   - Password: Create a strong password (save it!)
   - Click **"Create User"**
5. **Network access:**
   - Click **"Add My Current IP Address"** → **Finish and Close**
   - Or add `0.0.0.0/0` to allow all IPs (easier for development)
6. **Get connection string:**
   - Click **"Connect"** on your cluster
   - Choose **"Drivers"**
   - Select **Node.js** driver
   - Copy the connection string that looks like:
   ```
   mongodb+srv://netops_user:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add `/netops` before the `?` to specify database name:
   ```
   mongodb+srv://netops_user:YourPassword@cluster0.abc123.mongodb.net/netops?retryWrites=true&w=majority
   ```

---

## ✅ STEP 5: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

Now open `.env.local` in VS Code and fill in:

```env
# Paste your MongoDB connection string here
MONGODB_URI="mongodb+srv://netops_user:YourPassword@cluster0.abc123.mongodb.net/netops?retryWrites=true&w=majority"

# Generate a random secret (copy the output of this command):
# Run in terminal: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET="paste-the-output-here"

NEXTAUTH_URL="http://localhost:3000"

# AI Settings (start with openai if you don't have Ollama)
AI_PROVIDER="auto"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"

# Optional: Add OpenAI key for fallback
OPENAI_API_KEY="sk-your-key-here"
```

### Generate AUTH_SECRET quickly:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output into `AUTH_SECRET`.

---

## ✅ STEP 6: Set Up Database Schema

```bash
# Generate the Prisma client (must do this after npm install)
npx prisma generate

# Push the schema to your MongoDB database
npx prisma db push
```

You should see: `✅ Your database is now in sync with your Prisma schema`

---

## ✅ STEP 7: Seed Demo Accounts

```bash
npx tsx scripts/seed.ts
```

Output:
```
✅ ADMIN: admin@netops.dev / admin123
✅ SENIOR_ENGINEER: senior@netops.dev / senior123
✅ JUNIOR_ENGINEER: junior@netops.dev / junior123
✅ Sample log entries created
✅ Sample configs created
🎉 Seeding complete!
```

---

## ✅ STEP 8 (Optional): Install Ollama for Local AI

Ollama runs AI models locally on your machine — network logs stay private!

### macOS:
```bash
brew install ollama
# OR download from https://ollama.ai
```

### Windows:
- Download installer from https://ollama.ai

### After installing:
```bash
# Pull the Llama 3 model (downloads ~4.7GB)
ollama pull llama3

# Start the Ollama server (keep this running in background)
ollama serve
```

> **Without Ollama:** The app will use OpenAI if you have an API key, or show demo mock responses.

---

## ✅ STEP 9: Start the App!

```bash
npm run dev
```

Open your browser: **http://localhost:3000**

Login with:
- `admin@netops.dev` / `admin123` (full access)
- `senior@netops.dev` / `senior123` (log analysis + configs)
- `junior@netops.dev` / `junior123` (configs only)

---

## 🌍 DEPLOYMENT — Share with Friends & Teachers

### Option A: Deploy to Vercel (RECOMMENDED — Free, 5 minutes)

1. **Push to GitHub first:**
```bash
git init
git add .
git commit -m "feat: initial NetOps AI Copilot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/netops-ai-copilot.git
git push -u origin main
```

2. **Go to https://vercel.com** → Sign in with GitHub

3. **Click "New Project"** → Import your `netops-ai-copilot` repository

4. **Add Environment Variables** (click "Environment Variables"):
   - `MONGODB_URI` → your MongoDB connection string
   - `AUTH_SECRET` → your generated secret
   - `NEXTAUTH_URL` → `https://your-app-name.vercel.app` (Vercel shows you the URL)
   - `AI_PROVIDER` → `openai` (Ollama doesn't work in cloud)
   - `OPENAI_API_KEY` → your OpenAI key (optional)

5. **Click Deploy** → Wait ~2 minutes → Done! 🎉

Your app is live at: `https://your-app-name.vercel.app`

Share this URL with friends and teachers!

### Option B: Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway add --plugin mongodb   # Optional: use Railway's MongoDB
railway up
```

Set environment variables in Railway dashboard.

---

## 🔍 View Your Database (Optional)

```bash
npx prisma studio
```

Opens a GUI at http://localhost:5555 where you can browse all your MongoDB data visually.

---

## ❓ Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules
npm install
npx prisma generate
```

### MongoDB connection fails
- Check your connection string in `.env.local`
- Make sure your IP is whitelisted in MongoDB Atlas Network Access
- Verify username and password are correct

### Auth not working
- Make sure `AUTH_SECRET` is at least 32 characters
- Make sure `NEXTAUTH_URL` matches your actual URL exactly

### AI returns mock responses
- Install Ollama and run `ollama serve`
- Or add `OPENAI_API_KEY` to your `.env.local`
- Check console for AI error messages

### Port 3000 already in use
```bash
npm run dev -- -p 3001
# Then open http://localhost:3001
```

---

## 📚 Learning Resources

- **Next.js App Router**: https://nextjs.org/docs/app
- **Auth.js v5**: https://authjs.dev/getting-started
- **Prisma with MongoDB**: https://www.prisma.io/docs/guides/database/mongodb
- **Ollama**: https://ollama.ai/docs
- **Cisco DevNet**: https://developer.cisco.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

Happy networking! 🌐
