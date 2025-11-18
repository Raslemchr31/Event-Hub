# EventScout AI - Research Findings & Implementation Plan

## QUICK SUMMARY

**Project Status**: Empty repo - greenfield project
**Timeline**: Ready to build immediately
**Key Decision**: Use Claude Agent SDK + Next.js 14 + TypeScript

---

## TECH STACK DECISIONS

### Core Framework
- **Next.js 14** (App Router) + TypeScript
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`)
- **Vercel** deployment

### QR Scanning
- **html5-qrcode** - Best mobile browser support (iOS Safari + Android Chrome)
- Works with getUserMedia API (requires HTTPS)

### Web Scraping
- **Cheerio** - Static HTML (fast, lightweight)
- **Playwright** - Dynamic sites (JS-rendered)
- **Issue**: Playwright on Vercel needs `playwright-core` + `@sparticuz/chromium`

### Image Analysis
- **Claude Vision API** - Built-in OCR + understanding
- Model: `claude-sonnet-4-20250514`
- Supports base64 images directly

### Web Search
- **Tavily API** - Better for AI agents ($8/1000 requests, 1000 free/month)
- Alternative: Perplexity ($5/1000 requests, faster but less structured)

### Camera Access
- **navigator.mediaDevices.getUserMedia()**
- **Limitation**: iOS only works in Safari (not Chrome/Firefox)
- **Requirement**: HTTPS or localhost

---

## IMPLEMENTATION ROADMAP

### Phase 1: Project Setup (30 min)
```bash
npm create next-app@latest eventscout-ai --typescript --app --tailwind
npm install @anthropic-ai/claude-agent-sdk
npm install html5-qrcode cheerio axios
npm install playwright-core @sparticuz/chromium
npm install zod
```

### Phase 2: Core Agent (1-2 hours)
**File**: `/app/api/agent/route.ts`

Agent tools:
1. `scrape_website` - Cheerio + Playwright fallback
2. `analyze_image` - Claude Vision API
3. `web_search` - Tavily API
4. `generate_icebreakers` - Claude with context
5. `check_confidence` - Score calculator

### Phase 3: Frontend (1-2 hours)
- QR scanner component (html5-qrcode)
- Camera capture for photos
- Results display
- Mobile-first UI (Tailwind)

### Phase 4: Deployment (30 min)
- Vercel deployment
- Environment variables
- Test on mobile

---

## CRITICAL DETAILS

### Environment Variables Needed
```
ANTHROPIC_API_KEY=sk-ant-xxx
TAVILY_API_KEY=tvly-xxx
NEXT_PUBLIC_APP_URL=https://eventscout.vercel.app
```

### Vercel Playwright Config
- Use `playwright-core` (not `playwright`)
- Use `@sparticuz/chromium` for browser
- Edge function limits: 5KB per env var

### iOS Camera Gotcha
- Only Safari supports getUserMedia on iOS
- Must use HTTPS (Vercel handles this)
- Request camera permission on first use

### Agent Workflow
```
QR Scan → Scrape URL →
  ├─ Success (>70% confidence) → Generate Icebreakers
  └─ Fail → Request Photo → Analyze Image →
      ├─ Success → Web Search → Generate Icebreakers
      └─ Fail → Ask Manual Input → Web Search → Generate Icebreakers
```

---

## NEXT STEPS

1. Initialize Next.js project
2. Set up Claude Agent SDK with tools
3. Build QR scanner UI
4. Implement agent workflow
5. Deploy to Vercel
6. Test on mobile devices

**Estimated Total Time**: 4-6 hours for MVP
