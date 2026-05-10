# 🌐 NetOps AI Copilot

> An AI-powered network operations dashboard for Cisco engineers — built with Next.js 15, Prisma, MongoDB, Auth.js v5, and Ollama (local LLM with OpenAI fallback).

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📸 Screenshots

| Dashboard | Log Analyzer | Config Generator |
|-----------|-------------|-----------------|
| Real-time stats & charts | AI-powered syslog analysis | Intent-to-IOS-CLI |

---

## ✨ Key Features

### 🔍 AI Log Analyzer (Observability)
- Paste Cisco syslog data (router, switch, firewall)
- Local **Llama 3** via **Ollama** detects anomalies: BGP flapping, interface drops, brute-force attempts, CPU spikes
- Plain-English explanations with exact Cisco `show` commands to investigate
- Severity classification: CRITICAL → HIGH → MEDIUM → LOW → INFO
- OpenAI GPT-4o-mini as automatic fallback if Ollama is offline

### ⚙️ Intent-to-Config Generator (Automation)
- Type natural English: *"Block IP 192.168.1.50 and allow all else"*
- Get production-ready **Cisco IOS / NX-OS / ASA CLI** commands
- Platform selector: IOS, IOS-XE, NX-OS, ASA, IOS-XR
- Includes verification commands and rollback procedures
- All configs saved to MongoDB for audit history

### 🛡️ RBAC Security (Role-Based Access Control)
| Role | Permissions |
|------|------------|
| `VIEWER` | View dashboard only |
| `JUNIOR_ENGINEER` | + Generate configs |
| `SENIOR_ENGINEER` | + Analyze logs |
| `ADMIN` | Full access + manage users |

### 📊 Threat Intelligence Dashboard
- Weekly activity area chart (logs, configs, critical alerts)
- Severity distribution bar visualization
- Real-time recent activity feed
- System status panel (AI engine, database, Ollama)

### 🔒 Privacy-First AI Architecture
```
Request → Try Ollama (local, private) → If unavailable → OpenAI (fallback)
```
Network logs never leave your infrastructure when Ollama is running.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | Custom Cisco-themed dark UI, Recharts |
| **Backend** | Next.js Route Handlers (serverless API) |
| **Database** | MongoDB Atlas + Prisma ORM |
| **Authentication** | Auth.js v5 (Credentials + JWT) |
| **AI Primary** | Ollama + Llama 3 (local, private) |
| **AI Fallback** | OpenAI GPT-4o-mini |
| **Validation** | Zod |
| **Password Hashing** | bcryptjs (cost factor 12) |

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
git clone https://github.com/YOUR_USERNAME/netops-ai-copilot.git
cd netops-ai-copilot
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up MongoDB (Free)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account → **Create a Free Cluster** (M0 Sandbox)
3. **Database Access** → Add a user with a password
4. **Network Access** → Add IP `0.0.0.0/0` (allow all) for development
5. **Connect** → **Drivers** → Copy the connection string

It looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/netops?retryWrites=true&w=majority
```

### Step 4: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB
MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/netops?retryWrites=true&w=majority"

# Auth.js — generate a secret:
# Run: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Ollama (optional — install from https://ollama.ai)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"

# OpenAI (optional fallback)
OPENAI_API_KEY="sk-..."

# AI mode: "auto" tries Ollama first, falls back to OpenAI
AI_PROVIDER="auto"
```

### Step 5: Push Database Schema

```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to MongoDB
```

### Step 6: Seed Demo Accounts

```bash
npx tsx scripts/seed.ts
```

This creates 3 demo accounts:
| Email | Password | Role |
|-------|----------|------|
| admin@netops.dev | admin123 | ADMIN |
| senior@netops.dev | senior123 | SENIOR_ENGINEER |
| junior@netops.dev | junior123 | JUNIOR_ENGINEER |

### Step 7: Set Up Ollama (Optional but Recommended)

```bash
# Install Ollama from https://ollama.ai
# macOS:
brew install ollama

# Then pull Llama 3:
ollama pull llama3

# Start Ollama server:
ollama serve
```

### Step 8: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
netops-ai-copilot/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/    # Auth.js catch-all handler
│   │   │   │   └── register/         # User registration endpoint
│   │   │   ├── analyze-logs/         # AI log analysis endpoint
│   │   │   ├── generate-config/      # AI config generation endpoint
│   │   │   ├── dashboard/stats/      # Dashboard statistics endpoint
│   │   │   ├── logs/[id]/            # Log CRUD operations
│   │   │   └── configs/[id]/         # Config CRUD operations
│   │   ├── auth/
│   │   │   ├── login/                # Login page
│   │   │   ├── register/             # Registration page
│   │   │   └── error/                # Auth error page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── logs/                 # Log analyzer page
│   │   │   ├── configs/              # Config generator page
│   │   │   └── settings/             # User settings page
│   │   ├── globals.css               # Global styles + Cisco theme
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page / redirect
│   ├── components/
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── stats-cards.tsx
│   │   │   ├── activity-chart.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── alerts-panel.tsx
│   │   │   └── quick-actions.tsx
│   │   ├── logs/
│   │   │   ├── log-analyzer.tsx      # AI log analysis UI
│   │   │   └── log-history.tsx       # Paginated log history
│   │   ├── config/
│   │   │   ├── config-generator.tsx  # AI config generation UI
│   │   │   └── config-history.tsx    # Saved configs list
│   │   ├── shared/
│   │   │   ├── landing-page.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── session-provider.tsx
│   │   │   └── permission-gate.tsx   # RBAC UI component
│   │   └── ui/
│   │       └── toaster.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── ai.ts                     # AI provider (Ollama → OpenAI)
│   │   ├── auth.ts                   # Auth.js config + RBAC helpers
│   │   ├── mongodb.ts                # MongoDB connection
│   │   ├── prisma.ts                 # Prisma singleton
│   │   └── utils.ts                  # Shared utilities
│   ├── middleware.ts                  # Route protection
│   └── types/
│       └── index.ts                  # TypeScript types
├── prisma/
│   └── schema.prisma                 # Database schema
├── scripts/
│   └── seed.ts                       # Demo data seeder
├── .env.example                      # Environment template
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔐 Authentication & RBAC Deep Dive

### How Auth.js v5 Works Here

1. User submits login form → `POST /api/auth/signin`
2. Auth.js calls our `authorize()` function
3. We verify email/password against MongoDB (bcrypt)
4. Auth.js creates a **JWT** containing `{ id, email, name, role }`
5. JWT is stored in an **httpOnly cookie** (secure, XSS-safe)
6. Every request includes the cookie automatically
7. `auth()` function reads the JWT on server components/API routes

### How RBAC Works

```typescript
// Define permissions per role (src/lib/auth.ts)
const ROLE_PERMISSIONS = {
  VIEWER: ["view:dashboard"],
  JUNIOR_ENGINEER: ["view:dashboard", "generate:config"],
  SENIOR_ENGINEER: ["view:dashboard", "analyze:logs", "generate:config"],
  ADMIN: ["view:dashboard", "analyze:logs", "generate:config", "view:all_logs", ...]
}

// API Route check (server-side)
if (!canAnalyzeLogs(session.user.role)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// UI check (client-side via PermissionGate component)
<PermissionGate role={session.user.role} permission="analyze:logs">
  <LogAnalyzer />
</PermissionGate>
```

---

## 🤖 AI Architecture Deep Dive

### Provider Priority
```
Request → isOllamaAvailable()? → YES → Use Ollama (local, private)
                                 NO  → OpenAI API key set? → YES → Use OpenAI
                                                              NO  → Mock response
```

### Why Local AI for Enterprise
- **Data Privacy**: Network logs contain sensitive topology data — they never leave your infrastructure
- **Cost**: No per-token API costs for high-volume log analysis
- **Latency**: No network roundtrip for AI inference
- **Compliance**: GDPR, SOC2, HIPAA-friendly

### Customizing AI Prompts
Edit `src/lib/ai.ts` → `SYSTEM_PROMPTS` object to tune for your specific Cisco environment.

---

## 🌍 Deployment Guide

### Option 1: Vercel (Recommended — Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Add environment variables in Vercel dashboard (same as `.env.local`)
4. Change `NEXTAUTH_URL` to your Vercel domain: `https://your-app.vercel.app`
5. **Deploy** — done! 🎉

> **Note:** Ollama runs locally, so for cloud deployment, only OpenAI fallback works. For enterprise use, deploy Ollama on a VPS and set `OLLAMA_BASE_URL` to that server's URL.

### Option 2: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

### Option 3: Docker (Self-Hosted)

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
docker build -t netops-ai-copilot .
docker run -p 3000:3000 --env-file .env.local netops-ai-copilot
```

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma db push   # Push schema changes to MongoDB
npx prisma studio    # Open Prisma Studio GUI (database viewer)
npx tsx scripts/seed.ts  # Seed demo accounts
```

---

## 🎯 Interview Talking Points (Cisco Specific)

### Why This Project Aligns with Cisco

1. **Intent-Based Networking (IBN)**: Our Config Generator is exactly what Cisco's DNA Center does — translate business intent to network configuration
2. **AIOps**: Cisco is integrating AI into Catalyst Center; our log analyzer mirrors this use case
3. **Data Privacy**: Using local LLMs (Ollama) demonstrates understanding of enterprise security requirements — logs are sensitive
4. **RBAC**: Cisco's enterprise customers require granular access control — we implement it at middleware, API, and UI layers
5. **Observability**: Log analysis aligns with Cisco's Thousand Eyes and AppDynamics products

### Key Technical Decisions to Explain

- **Why MongoDB over PostgreSQL?** Log data is semi-structured (different anomalies, varying fields) — MongoDB's flexible schema handles this well
- **Why JWT over database sessions?** JWT is stateless — works better with serverless/edge deployments and Ollama's local nature
- **Why Ollama first?** Enterprise security principle: minimize data egress, especially for network topology information
- **Why Next.js App Router?** Server Components reduce client-side JavaScript, improving performance for data-heavy dashboards

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add: your feature description'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Cisco DevNet](https://developer.cisco.com) for networking inspiration
- [Ollama](https://ollama.ai) for local LLM infrastructure
- [Auth.js](https://authjs.dev) for authentication
- [Prisma](https://prisma.io) for database ORM
- [Vercel](https://vercel.com) for deployment platform

---

<div align="center">
  <strong>Built with ❤️ for Cisco Network Engineers</strong><br/>
  <sub>NetOps AI Copilot — Where Intent Meets Network Intelligence</sub>
</div>
