# EventScout AI - Smart Networking Assistant

AI-powered mobile app for event attendees at green energy and industrial sector events. Analyzes QR codes, scrapes company info, and generates intelligent icebreaker questions to help start conversations with exhibitors.

## Features

- **QR Code Scanner**: Scan exhibitor QR codes via phone camera
- **Smart Web Scraper**: Extract company info from QR destination URL
- **Image Analysis**: Photograph booth/flyer and extract context using Google Gemini Vision API
- **Intelligent Web Search**: Search web with smart keywords when direct info unavailable
- **Icebreaker Generator**: Produce 3-5 conversation starters based on company context
- **Confidence-Based Flow**: Agent asks for more context when confidence is low

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Google Gemini AI** (Gemini 2.5 Flash) for image analysis and icebreaker generation
- **Tavily API** for intelligent web search
- **html5-qrcode** for QR scanning
- **Cheerio** for web scraping
- **Tailwind CSS** for styling
- **Vercel** for deployment

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (get from [aistudio.google.com](https://aistudio.google.com/app/apikey))
- Tavily API key (optional, get from [tavily.com](https://tavily.com))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Event-Hub
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
TAVILY_API_KEY=tvly-your-api-key-here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Mobile Testing

For camera access to work on mobile devices:
- Use HTTPS (Vercel provides this automatically)
- iOS: Only Safari supports getUserMedia (Chrome/Firefox won't work)
- Android: Chrome and most browsers work

## User Flow

1. **User at event booth** → Opens app → Chooses scan method
2. **Option A: Scan QR Code**
   - App scrapes URL content
   - If content found → Generates icebreakers
   - If no content → Prompts for photo
3. **Option B: Take Photo**
   - AI extracts text/context from image
   - Searches web for company info
   - Generates icebreakers
4. **Option C: Manual Entry**
   - User types company name
   - Searches web for info
   - Generates icebreakers
5. **Results** → Display company overview + 4 conversation starters

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `TAVILY_API_KEY`
4. Deploy

The app will be available at `https://your-project.vercel.app`

## API Routes

### POST `/api/analyze`

Analyzes input and generates icebreakers.

**Request Body:**
```json
{
  "type": "qr" | "image" | "manual",
  "data": {
    "url": "https://...",        // for QR
    "imageBase64": "...",        // for image
    "companyName": "...",        // for manual
    "industry": "..."            // optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company": "Company Name",
    "industry": "green energy",
    "overview": "Company description...",
    "icebreakers": [
      "Question 1...",
      "Question 2...",
      ...
    ]
  }
}
```

## Project Structure

```
Event-Hub/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts       # Main agent API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main UI
├── components/
│   ├── camera/
│   │   └── CameraCapture.tsx  # Camera component
│   └── scanner/
│       └── QRScanner.tsx      # QR scanner component
├── lib/
│   ├── tools/
│   │   ├── scrape-website.ts
│   │   ├── analyze-image.ts
│   │   ├── web-search.ts
│   │   ├── generate-icebreakers.ts
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── .env.example
├── package.json
└── README.md
```

## Agent Workflow

The AI agent follows this decision tree:

```
Input (QR/Photo/Manual)
  ↓
Analyze & Extract Context
  ↓
Check Confidence (threshold: 70%)
  ↓
├─ High Confidence → Generate Icebreakers
└─ Low Confidence → Request More Info
     ↓
   Web Search for Additional Context
     ↓
   Generate Icebreakers
```

## Limitations

- iOS camera only works in Safari (not Chrome/Firefox)
- QR scanner requires camera permissions
- Tavily API: 1000 free searches/month (then paid)
- Image analysis uses Google Gemini API credits

## Success Criteria

- Scan QR code → Get icebreakers in < 10 seconds
- Handles broken QR codes gracefully
- Works on iPhone and Android
- Agent doesn't hallucinate (all info is sourced)
- Confidence gating works (asks for help when uncertain)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
