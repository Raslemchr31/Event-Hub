import axios from 'axios';
import * as cheerio from 'cheerio';
import { CompanyContext } from '@/lib/types';

export async function scrapeWebsite(
  url: string,
  extractFormFields: boolean = false
): Promise<CompanyContext> {
  try {
    // Fetch the HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, noscript').remove();

    // Extract text content
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract meta tags
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';

    // Extract company name from various sources
    let companyName = title || ogTitle || '';

    // Look for common company name patterns
    const h1Text = $('h1').first().text();
    if (h1Text && h1Text.length < 100) {
      companyName = h1Text;
    }

    // Extract form fields if requested
    let formFields: string[] = [];
    if (extractFormFields) {
      $('input[name], select[name], textarea[name]').each((_, el) => {
        const name = $(el).attr('name');
        if (name) formFields.push(name);
      });
    }

    // Try to detect industry from keywords
    const industrialKeywords = [
      'energy', 'solar', 'wind', 'renewable', 'industrial', 'engineering',
      'manufacturing', 'automation', 'electric', 'power', 'sustainability'
    ];

    const combinedText = `${bodyText} ${description} ${ogDescription}`.toLowerCase();
    const detectedIndustry = industrialKeywords.find(kw => combinedText.includes(kw));

    // Calculate confidence based on data quality
    let confidence = 0;
    if (companyName) confidence += 40;
    if (description || ogDescription) confidence += 30;
    if (detectedIndustry) confidence += 20;
    if (bodyText.length > 200) confidence += 10;

    return {
      name: companyName.substring(0, 200),
      industry: detectedIndustry,
      description: (description || ogDescription || bodyText.substring(0, 500)).trim(),
      website: url,
      confidence,
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      name: '',
      confidence: 0,
    };
  }
}
