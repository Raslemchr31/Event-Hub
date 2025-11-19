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

    // Extract text content from key areas
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const h1Texts = $('h1, h2, h3').map((_, el) => $(el).text()).get().join(' ');
    const paragraphs = $('p').map((_, el) => $(el).text()).get().join(' ');
    const allText = `${h1Texts} ${paragraphs} ${bodyText}`.substring(0, 2000);

    // Extract meta tags
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    // Extract company name from various sources
    let companyName = ogTitle || title || '';

    // Look for common company name patterns
    const h1Text = $('h1').first().text().trim();
    if (h1Text && h1Text.length > 0 && h1Text.length < 100) {
      companyName = h1Text;
    }

    // Extract products/services mentioned
    const products: string[] = [];
    $('h2, h3, .product, .service').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 100) {
        products.push(text);
      }
    });

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
      'manufacturing', 'automation', 'electric', 'power', 'sustainability',
      'green', 'clean tech', 'climate', 'carbon', 'battery', 'ev', 'electric vehicle'
    ];

    const combinedText = `${allText} ${description} ${ogDescription} ${keywords}`.toLowerCase();
    const detectedIndustry = industrialKeywords.find(kw => combinedText.includes(kw));

    // Calculate confidence based on data quality - LOWERED THRESHOLD
    let confidence = 0;
    if (companyName && companyName.length > 2) confidence += 50; // Increased
    if (description || ogDescription) confidence += 20;
    if (detectedIndustry) confidence += 15;
    if (allText.length > 200) confidence += 15;

    // Comprehensive description
    const fullDescription = [
      description,
      ogDescription,
      allText.substring(0, 800)
    ].filter(Boolean).join(' ').trim();

    return {
      name: companyName.substring(0, 200).trim(),
      industry: detectedIndustry,
      description: fullDescription,
      products: products.slice(0, 5), // Top 5 products
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
