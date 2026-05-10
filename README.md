# 💸 Splitr

> The smartest way to split expenses with friends.

An AI-powered full-stack expense splitting app — built with Next.js 15, Convex, Clerk, Inngest, Gemini AI, and Shadcn UI. Track shared expenses, split bills effortlessly, and settle up quickly. Never worry about who owes who again.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Convex](https://img.shields.io/badge/Convex-Database-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📸 Screenshots

| Landing Page | Dashboard | Group Expenses |
|---|---|---|
| Smart split, zero confusion | Track balances at a glance | Manage group debts easily |

---

## ✨ Key Features

### 💬 Group Expenses
- Create groups for roommates, trips, or events
- Invite friends and manage members
- Keep all group expenses organized in one place

### 🧠 Smart Settlements
- AI-powered algorithm minimizes the number of transactions needed to settle up
- Gemini AI generates personalized spending insights per user
- Understand your financial patterns with intelligent summaries

### 📊 Expense Analytics
- Track spending patterns across groups and individuals
- Visual breakdown of shared costs
- Historical expense timeline

### 🔔 Payment Reminders (Automated)
- Inngest-powered CRON jobs send automated email reminders for pending debts
- Resend integration for reliable email delivery
- Reminder cadence handled fully server-side — no manual follow-ups

### ✂️ Multiple Split Types
- Split equally among all members
- Split by percentage
- Split by exact custom amounts

### ⚡ Real-Time Updates
- Powered by Convex — see new expenses and payments the moment friends add them
- No refresh needed, everything syncs live

### 🔐 Authentication (Clerk)
- Secure sign-up and login via Clerk
- Custom login and sign-up pages
- User data synced to Convex database automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| UI Components | Shadcn UI |
| Backend / Database | Convex (real-time serverless DB) |
| Authentication | Clerk |
| AI | Google Gemini AI (spending insights) |
| Background Jobs | Inngest (CRON jobs, reminders) |
| Email | Resend |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
node --version   # v18+ required (v20+ recommended)
npm --version    # v9+
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/spliter.git
cd spliter
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Clerk (Authentication)

1. Go to [https://clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your API keys from the Clerk dashboard

### Step 4: Set Up Convex (Database)

```bash
npx convex dev
```

This will prompt you to log in and create a new Convex project. Copy the deployment URL shown.

### Step 5: Set Up Inngest (Background Jobs)

1. Go to [https://www.inngest.com](https://www.inngest.com) and create a free account
2. Copy your Event Key and Signing Key from the dashboard

### Step 6: Set Up Resend (Email)

1. Go to [https://resend.com](https://resend.com) and create a free account
2. Generate an API key

### Step 7: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Resend (Email)
RESEND_API_KEY=re_...
```

### Step 8: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

In a separate terminal, keep Convex running:

```bash
npx convex dev
```

---

## 📁 Project Structure

```
spliter/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/              # Custom Clerk sign-in page
│   │   └── sign-up/              # Custom Clerk sign-up page
│   ├── (main)/
│   │   ├── dashboard/            # Main dashboard — balances overview
│   │   ├── contacts/             # 1-on-1 expense tracking
│   │   ├── groups/               # Group expense management
│   │   │   └── [groupId]/        # Individual group page
│   │   └── layout.tsx            # Authenticated layout with header
│   ├── api/
│   │   └── inngest/              # Inngest CRON job handlers
│   ├── globals.css
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── header.tsx                # App header with nav
│   ├── expense-form.tsx          # Create/edit expense UI
│   └── settlement-form.tsx       # Log payment UI
├── convex/
│   ├── schema.ts                 # Convex database schema
│   ├── users.ts                  # User mutations & queries
│   ├── groups.ts                 # Group mutations & queries
│   ├── expenses.ts               # Expense mutations & queries
│   └── settlements.ts            # Settlement mutations & queries
├── inngest/
│   ├── client.ts                 # Inngest client setup
│   ├── payment-reminders.ts      # Automated reminder CRON
│   └── ai-insights.ts            # Gemini AI insights CRON
├── lib/
│   └── utils.ts                  # Shared utilities
├── public/
│   ├── hero.png
│   └── logos/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🤖 AI Architecture

### How Gemini AI Works Here

Splitr uses **Google Gemini AI** for generating personalized spending insights per user. This runs as a background job via Inngest — not on every request — keeping it fast and cost-efficient.

```
Inngest CRON (weekly) → Fetch user's expense history from Convex
                       → Send to Gemini AI with context prompt
                       → Store AI insights back in Convex
                       → Display on user dashboard
```

### Why Gemini for This Use Case

- **Cost-effective** for periodic, batch insight generation
- **Natural language summaries** of spending patterns (e.g. "You spent 40% more on dining this month")
- **No sensitive financial data** leaves the app — only aggregated totals are sent

---

## ⚙️ Background Jobs (Inngest)

Splitr uses **Inngest** for two automated CRON jobs:

| Job | Schedule | What it does |
|---|---|---|
| Payment Reminders | Daily | Finds unsettled debts and emails reminders via Resend |
| AI Insights | Weekly | Generates Gemini AI spending summaries per user |

These run fully server-side with zero manual intervention. No cron infrastructure to manage — Inngest handles retries, logs, and monitoring.

---

## 🌍 Deployment Guide

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add all environment variables from `.env.local`
4. Deploy — done! 🎉

For Inngest, register your production endpoint:
```
https://your-app.vercel.app/api/inngest
```

### Option 2: Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t spliter .
docker run -p 3000:3000 --env-file .env.local spliter
```

---

## 📝 Available Scripts

```bash
npm run dev           # Start development server (hot reload)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npx convex dev        # Start Convex local dev server
npx convex deploy     # Deploy Convex functions to production
```

---

## 🎯 Key Technical Decisions

**Why Convex over a traditional database?**
Real-time sync is core to Splitr — when a friend adds an expense, you see it instantly. Convex handles WebSocket subscriptions automatically with no extra setup.

**Why Clerk over Auth.js / NextAuth?**
Clerk provides production-grade auth (MFA, social logins, user management UI) with minimal code. For an expense app where trust matters, this is the right tradeoff.

**Why Inngest for background jobs?**
CRON jobs on serverless platforms (Vercel) are unreliable. Inngest gives reliable scheduling, retries, and full observability — critical for payment reminders that must actually send.

**Why Gemini AI over OpenAI?**
Gemini's free tier is generous enough for batch weekly insight generation at zero cost during development and low-traffic phases.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add: your feature description'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [RoadsideCoder](https://www.youtube.com/@RoadsideCoder) for the original tutorial inspiration
- [Convex](https://convex.dev) for real-time database infrastructure
- [Clerk](https://clerk.com) for authentication
- [Inngest](https://inngest.com) for background job orchestration
- [Shadcn UI](https://ui.shadcn.com) for the component library
- [Resend](https://resend.com) for email delivery

---

Built with ❤️ — Splitr: *Split expenses. Simplify life.*
