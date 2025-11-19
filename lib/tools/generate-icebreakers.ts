import { GoogleGenAI } from '@google/genai';
import { CompanyContext, IcebreakerResult } from '@/lib/types';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateIcebreakers(
  context: CompanyContext,
  numQuestions: number = 4
): Promise<IcebreakerResult> {
  try {
    const contextText = buildContextText(context);

    const prompt = `You are a professional networking assistant helping attendees at green energy and industrial sector events. Your job is to generate thoughtful, specific icebreaker questions based on company information.

CRITICAL RULES:
- Generate questions that are specific to THIS company, not generic
- Focus on their work, technology, and recent developments
- Be professional, patient, and genuinely curious
- Questions should demonstrate you did your research
- Avoid yes/no questions - ask open-ended ones
- Match this communication style: patient, thoughtful, technically informed but approachable

Based on this company information, generate ${numQuestions} specific icebreaker questions I can ask their booth representative:

${contextText}

Return a JSON object with:
{
  "overview": "2-3 sentence company summary",
  "icebreakers": ["question 1", "question 2", ...],
  "key_topics": ["topic 1", "topic 2", ...]
}

Make the questions specific to their work, not generic networking questions.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      return createFallbackIcebreakers(context);
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createFallbackIcebreakers(context);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      company: context.name,
      industry: context.industry,
      overview: parsed.overview || context.description || 'Company information available.',
      icebreakers: parsed.icebreakers || [],
      sources: parsed.key_topics || [],
    };
  } catch (error) {
    console.error('Icebreaker generation error:', error);
    return createFallbackIcebreakers(context);
  }
}

function buildContextText(context: CompanyContext): string {
  let text = `Company: ${context.name}\n`;

  if (context.industry) {
    text += `Industry: ${context.industry}\n`;
  }

  if (context.description) {
    text += `Description: ${context.description}\n`;
  }

  if (context.products && context.products.length > 0) {
    text += `Products/Services: ${context.products.join(', ')}\n`;
  }

  if (context.recent_news) {
    text += `Recent Information: ${context.recent_news}\n`;
  }

  if (context.website) {
    text += `Website: ${context.website}\n`;
  }

  return text;
}

function createFallbackIcebreakers(context: CompanyContext): IcebreakerResult {
  const companyName = context.name || 'this company';

  return {
    company: context.name,
    industry: context.industry,
    overview: context.description || `Information about ${companyName}.`,
    icebreakers: [
      `Can you tell me more about ${companyName}'s main focus in the ${context.industry || 'industry'}?`,
      `What are some of the key challenges you're helping customers solve?`,
      `I'd love to learn about your latest projects or innovations.`,
      `How does ${companyName} differentiate itself in this space?`,
    ],
  };
}
