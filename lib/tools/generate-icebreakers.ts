import Anthropic from '@anthropic-ai/sdk';
import { CompanyContext, IcebreakerResult } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateIcebreakers(
  context: CompanyContext,
  numQuestions: number = 4
): Promise<IcebreakerResult> {
  try {
    const contextText = buildContextText(context);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a professional networking assistant helping attendees at green energy and industrial sector events. Your job is to generate thoughtful, specific icebreaker questions based on company information.

CRITICAL RULES:
- Generate questions that are specific to THIS company, not generic
- Focus on their work, technology, and recent developments
- Be professional, patient, and genuinely curious
- Questions should demonstrate you did your research
- Avoid yes/no questions - ask open-ended ones
- Match this communication style: patient, thoughtful, technically informed but approachable`,
      messages: [
        {
          role: 'user',
          content: `Based on this company information, generate ${numQuestions} specific icebreaker questions I can ask their booth representative:

${contextText}

Return a JSON object with:
{
  "overview": "2-3 sentence company summary",
  "icebreakers": ["question 1", "question 2", ...],
  "key_topics": ["topic 1", "topic 2", ...]
}

Make the questions specific to their work, not generic networking questions.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
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
