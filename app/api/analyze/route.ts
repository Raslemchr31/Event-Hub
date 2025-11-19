import { NextRequest, NextResponse } from 'next/server';
import {
  scrapeWebsite,
  analyzeImage,
  webSearch,
  generateIcebreakers,
  checkConfidence,
} from '@/lib/tools';
import { CompanyContext, IcebreakerResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('=== AGENT START ===');
    console.log('Type:', type);
    console.log('Data:', JSON.stringify(data).substring(0, 100));

    let context: CompanyContext | null = null;
    let step = '';

    // STEP 1: Analyze based on input type
    if (type === 'qr' && data.url) {
      step = 'Analyzing QR code destination...';
      context = await scrapeWebsite(data.url);

      // Check confidence
      const confidenceCheck = checkConfidence(context);

      if (confidenceCheck.recommendation === 'ask_for_input') {
        // Try extracting from form fields
        const formContext = await scrapeWebsite(data.url, true);
        if (formContext.confidence > context.confidence) {
          context = formContext;
        }
      }
    } else if (type === 'image' && data.imageBase64) {
      step = 'Analyzing booth photo...';
      context = await analyzeImage(data.imageBase64, data.context);
    } else if (type === 'manual' && data.companyName) {
      step = 'Searching for company information...';
      context = {
        name: data.companyName,
        industry: data.industry,
        confidence: 80, // High confidence for manual entry - user provided the info
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid request type or missing data' },
        { status: 400 }
      );
    }

    // STEP 2: Check confidence and decide next action
    const confidenceCheck = checkConfidence(context);
    console.log('Confidence:', context.confidence, 'Recommendation:', confidenceCheck.recommendation);

    if (confidenceCheck.recommendation === 'ask_for_input' && type !== 'manual') {
      if (type === 'qr') {
        return NextResponse.json({
          success: false,
          needsPhoto: true,
          message: "I couldn't find enough info from the QR code. Can you take a photo of their booth or flyer?",
          step,
        });
      } else if (type === 'image') {
        return NextResponse.json({
          success: false,
          needsManualInput: true,
          message: "I'm having trouble reading the image clearly. Can you type the company name?",
          step,
        });
      }
    }

    // STEP 3: Enhance with web search if needed
    if (context.name) {
      step = 'Searching for recent information...';
      console.log('Running web search for:', context.name);
      const searchQuery = `${context.name} ${context.industry || 'green energy industrial'} recent projects news`;
      const searchResults = await webSearch(searchQuery, 5);
      console.log('Web search confidence:', searchResults.confidence);

      // Merge search results with existing context
      context = {
        ...context,
        description: searchResults.description || context.description,
        recent_news: searchResults.recent_news || context.recent_news,
        confidence: Math.max(context.confidence, searchResults.confidence),
      };
    } else {
      console.warn('No company name to search for');
    }

    // STEP 4: Generate icebreakers
    step = 'Generating conversation starters...';
    console.log('Generating icebreakers for:', context.name);
    const result = await generateIcebreakers(context, 4);
    console.log('=== AGENT SUCCESS ===');

    return NextResponse.json({
      success: true,
      data: result,
      step,
    });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
