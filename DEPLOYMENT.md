# EventScout AI - Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Step 1: Get API Keys

1. **Google Gemini API Key** (Required)
   - Go to https://aistudio.google.com/app/apikey
   - Sign up or log in with Google account
   - Click "Create API Key"
   - Copy the API key

2. **Tavily API Key** (Optional but recommended)
   - Go to https://tavily.com
   - Sign up for free account
   - Get API key from dashboard
   - Free tier: 1000 searches/month

### Step 2: Deploy to Vercel

1. **Push to GitHub** (Already done!)
   ```bash
   # Your code is already pushed to:
   # branch: claude/eventscout-ai-agent-01CxffP5LoybtcKh69Jzk12c
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository: `Raslemchr31/Event-Hub`
   - Select branch: `claude/eventscout-ai-agent-01CxffP5LoybtcKh69Jzk12c`

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY = your-gemini-api-key-here
   TAVILY_API_KEY = tvly-your-api-key-here
   ```
   - Select all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Test on Mobile

1. Open the Vercel URL on your phone
2. Allow camera permissions when prompted
3. Try scanning a QR code or taking a photo
4. Verify icebreakers are generated

## Local Development

### Run Locally

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd Event-Hub
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
   TAVILY_API_KEY=tvly-your-api-key-here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

### Test on Mobile (Local Network)

1. **Get Your Local IP**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. **Run with HTTPS** (required for camera)
   ```bash
   # Use ngrok for HTTPS tunnel
   npx ngrok http 3000
   ```

   Open the HTTPS URL on your phone

## Production Checklist

- [ ] Google Generative AI API key added to Vercel (GOOGLE_GENERATIVE_AI_API_KEY)
- [ ] Tavily API key added to Vercel (optional)
- [ ] Deployed to Vercel successfully
- [ ] Tested QR scanning on mobile
- [ ] Tested camera capture on mobile
- [ ] Tested manual entry
- [ ] Verified icebreakers are generated
- [ ] iOS Safari tested
- [ ] Android Chrome tested

## Troubleshooting

### Camera Not Working on Mobile

**Issue**: Camera permission denied or not working

**Solutions**:
- **iOS**: Only Safari supports camera. Chrome/Firefox won't work.
- **Android**: Chrome works. Make sure HTTPS is enabled.
- **Permissions**: Go to browser settings → site permissions → allow camera

### QR Scanner Not Working

**Issue**: QR scanner doesn't start or shows error

**Solutions**:
- Ensure HTTPS is enabled (Vercel provides this automatically)
- Check camera permissions in browser
- Try refreshing the page
- Try a different browser (Safari on iOS)

### API Errors

**Issue**: "Failed to analyze" or 500 errors

**Solutions**:
- Check Vercel logs for specific error
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly
- Check API key has sufficient credits
- Verify API key hasn't expired

### Build Errors

**Issue**: Deployment fails on Vercel

**Solutions**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`
- Check TypeScript errors: `npm run lint`

## Cost Estimates

### Google Gemini API
- **Image Analysis**: ~$0.0001 per image (Gemini 2.5 Flash - significantly cheaper!)
- **Icebreaker Generation**: ~$0.0001 per request
- **Estimated**: $0.0002 per complete interaction (30x cheaper than Claude!)
- **100 users/day**: ~$0.02/day = $0.60/month (extremely affordable!)

### Tavily API
- **Free Tier**: 1000 searches/month
- **Paid**: $8 per 1000 additional searches
- **Estimated**: 50-100 searches/day on free tier

### Vercel Hosting
- **Free Tier**: Generous limits for hobby projects
- **Serverless Functions**: 100 GB-hours/month free
- **Bandwidth**: 100 GB/month free
- **Should be free** for testing and initial usage

### Total Monthly Cost (Estimated)
- **Light usage (10 users/day)**: $5-10/month
- **Medium usage (100 users/day)**: $20-30/month
- **Heavy usage (500 users/day)**: $100-150/month

## Next Steps

1. **Test at Real Event**: Take to an actual event and test with real QR codes
2. **Gather Feedback**: Get user feedback on icebreaker quality
3. **Monitor Usage**: Track API costs in Google AI Studio dashboard
4. **Optimize**: Reduce API calls where possible
5. **Analytics**: Add simple analytics to track usage patterns

## Support

For issues:
- Check Vercel deployment logs
- Review API error messages
- Test locally with `npm run dev`
- Check browser console for errors

Good luck at your next event! 🚀
