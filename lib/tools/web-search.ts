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
  numResults: number = 5
): Promise<CompanyContext> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    console.warn('Tavily API key not configured, using fallback search');
    return fallbackSearch(query);
  }

  try {
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
        timeout: 15000,
      }
    );

    const results = response.data.results as TavilySearchResult[];
    const answer = response.data.answer as string;

    // Extract company info from search results
    const combinedContent = results
      .map((r) => `${r.title}\n${r.content}`)
      .join('\n\n');

    // Extract company name from query
    const companyName = extractCompanyName(query);

    return {
      name: companyName,
      description: answer || combinedContent.substring(0, 500),
      recent_news: combinedContent.substring(0, 1000),
      confidence: results.length > 0 ? 80 : 40,
    };
  } catch (error) {
    console.error('Tavily search error:', error);
    return fallbackSearch(query);
  }
}

function extractCompanyName(query: string): string {
  // Remove common search terms
  const cleaned = query
    .replace(/\b(green energy|industrial|recent|news|projects|company|about)\b/gi, '')
    .trim();

  // Take first meaningful part
  const parts = cleaned.split(/\s+/);
  return parts.slice(0, 3).join(' ');
}

async function fallbackSearch(query: string): Promise<CompanyContext> {
  // Simple fallback - just return the query as company name
  return {
    name: extractCompanyName(query),
    description: 'Web search unavailable. Please provide more information about this company.',
    confidence: 30,
  };
}
