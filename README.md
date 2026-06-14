# GrowthPilot AI — Frontend

AI-native CRM frontend built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Provides a full campaign management flow from opportunity detection to AI post-mortem analysis.

Built as part of the Xeno SDE Internship assignment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Fonts | Inter + JetBrains Mono (Google Fonts) |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Mission Control — AI opportunity dashboard |
| `/audience` | Audience Builder — natural language segment creator |
| `/campaigns/new` | Strategy Battle — A vs B campaign simulation |
| `/campaigns` | Campaign Arena — all active campaigns |
| `/campaigns/[id]` | War Room — live campaign analytics |
| `/campaigns/[id]/postmortem` | Post-Mortem — AI analysis report |
| `/analytics` | Analytics — incremental revenue visualizer |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/pragya757/growthpilot-frontend.git
cd growthpilot-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variable

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://growthpilot-backend-3ec5.onrender.com
```

### 4. Run dev server

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://growthpilot-backend-3ec5.onrender.com` |

---

## Backend

The companion FastAPI backend lives at:
👉 [growthpilot-backend](https://github.com/pragya757/growthpilot-backend)

Live backend API: **https://growthpilot-backend-3ec5.onrender.com/docs**

---

## License

MIT
