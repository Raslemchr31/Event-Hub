import Anthropic from '@anthropic-ai/sdk';
import { CompanyContext } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeImage(
  imageBase64: string,
  context?: string
): Promise<CompanyContext> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this image from an event booth or flyer. Extract:
1. Company name
2. Industry/sector (especially green energy, industrial, engineering)
3. Products or services mentioned
4. Any other relevant business information

${context ? `Additional context: ${context}` : ''}

Return the information in this exact JSON format:
{
  "company_name": "...",
  "industry": "...",
  "products": ["...", "..."],
  "description": "...",
  "confidence": 0-100
}

If you cannot clearly read the information, set confidence low and explain what you can see.`,
            },
          ],
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
      return {
        name: '',
        confidence: 0,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      name: parsed.company_name || '',
      industry: parsed.industry,
      products: parsed.products || [],
      description: parsed.description,
      confidence: parsed.confidence || 0,
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      name: '',
      confidence: 0,
    };
  }
}
