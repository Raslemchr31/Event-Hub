import { GoogleGenAI } from '@google/genai';
import { CompanyContext } from '@/lib/types';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeImage(
  imageBase64: string,
  context?: string
): Promise<CompanyContext> {
  try {
    const contents = [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
      {
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
    ];

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    const text = response.text;

    if (!text) {
      return {
        name: '',
        confidence: 0,
      };
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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
