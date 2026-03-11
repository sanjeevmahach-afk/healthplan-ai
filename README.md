# HealthPlan AI — Deployment Guide

## Deploy to Vercel in 3 steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create healthplan-ai --public --push
```

### 2. Deploy on Vercel
- Go to https://vercel.com/new
- Import your GitHub repo
- Click **Deploy** — no config needed, vercel.json handles everything

### 3. Add Anthropic API key
- In Vercel dashboard → Settings → Environment Variables
- Add: `REACT_APP_ANTHROPIC_KEY` = your key from console.anthropic.com
- Update `src/App.jsx` fetch headers to include:
  ```js
  "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01"
  ```

## Install as phone app (PWA)
- **Android**: Open in Chrome → three-dot menu → "Add to Home Screen"
- **iPhone**: Open in Safari → Share → "Add to Home Screen"

The app installs with an icon, runs fullscreen, and works offline for the form (AI advisory requires internet).

## Local development
```bash
npm install
npm start
```
