# MoRNPrep

Smart meal planning & food guidance app. Track your meals, plan your week, get dietary guidance, manage recipes, and stay hydrated.

## Setup

### 1. Supabase Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase URL and anon key.

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### 5. Install on iPhone (PWA)

1. Open the deployed URL in Safari
2. Tap Share > "Add to Home Screen"
3. It works like a native app

## Features

- Login with name + PIN (simple, no email needed)
- Onboarding questionnaire (10 questions + PCOS-specific)
- Daily food check with guidance (good/okay/bad rating)
- PCOS-specific diet plan and food recommendations
- Meal tracker (planned → cooked → eaten)
- Fridge inventory at a glance
- Weekly planner with calendar view
- Recipe book (create, share via code, import)
- Water intake tracker with daily goal
- PWA - install on iOS/Android like a native app
