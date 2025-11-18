export { scrapeWebsite } from './scrape-website';
export { analyzeImage } from './analyze-image';
export { webSearch } from './web-search';
export { generateIcebreakers } from './generate-icebreakers';

export function checkConfidence(context: { confidence: number }): {
  score: number;
  recommendation: 'proceed' | 'ask_for_input';
} {
  const score = context.confidence;
  return {
    score,
    recommendation: score >= 70 ? 'proceed' : 'ask_for_input',
  };
}
