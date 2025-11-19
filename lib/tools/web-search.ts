import axios from 'axios';
import { CompanyContext } from '@/lib/types';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export async function webSearch(
  query: string,
  numResults: number = 5,
  retries: number = 3
): Promise<CompanyContext> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    console.error('❌ TAVILY_API_KEY not set in environment variables');
    console.error('Please add TAVILY_API_KEY to Vercel: Settings → Environment Variables');
    return fallbackSearch(query);
  }

  console.log(`🔍 Starting comprehensive web search for: "${query}"`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${retries}...`);

      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: tavilyApiKey, // API key in body
          query,
          max_results: numResults,
          include_answer: true,
          include_raw_content: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 20000, // Increased timeout for thorough search
        }
      );

      const results = response.data.results as TavilySearchResult[];
      const answer = response.data.answer as string;

      console.log(`✅ Web search successful! Found ${results.length} results`);

      // Extract company info from search results
      const combinedContent = results
        .map((r) => `${r.title}\n${r.content}`)
        .join('\n\n');

      // Extract company name from query
      const companyName = extractCompanyName(query);

      return {
        name: companyName,
        description: answer || combinedContent.substring(0, 800),
        recent_news: combinedContent.substring(0, 1500),
        confidence: results.length > 0 ? 85 : 40,
      };
    } catch (error: any) {
      console.error(`❌ Tavily search attempt ${attempt}/${retries} failed:`, error.message);

      if (attempt < retries) {
        const waitTime = attempt * 1000; // 1s, 2s, 3s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ All Tavily search attempts failed, using fallback');
        return fallbackSearch(query);
      }
    }
  }

  return fallbackSearch(query);
}

function extractCompanyName(query: string): string {
  // Remove common search terms
  const cleaned = query
    .replace(/\b(green energy|industrial|recent|news|projects|company|about|solar|renewable)\b/gi, '')
    .trim();

  // Take first meaningful part
  const parts = cleaned.split(/\s+/);
  return parts.slice(0, 3).join(' ');
}

async function fallbackSearch(query: string): Promise<CompanyContext> {
  // Simple fallback - just return the query as company name
  return {
    name: extractCompanyName(query),
    description: 'Web search unavailable. The TAVILY_API_KEY environment variable is not set in Vercel. Please add it in Settings → Environment Variables.',
    confidence: 30,
  };
}
