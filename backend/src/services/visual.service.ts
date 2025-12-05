import { BrandVoice } from '@prisma/client';
import { NarrativeTone } from '../types/index.js';
import { generateVisualPrompt } from './ai.service.js';

// ============================================
// NANO BANANA PRO (GEMINI 3 PRO IMAGE) SERVICE
// ============================================

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateImage';

// Platform-specific dimensions
const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  twitter: { width: 1200, height: 675 },
  facebook: { width: 1200, height: 630 },
  instagram: { width: 1080, height: 1080 },
  linkedin: { width: 1200, height: 627 },
  print: { width: 2480, height: 3508 }, // A4 at 300 DPI
};

const VISUAL_TYPE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  infographic: { width: 800, height: 2000 },
  poster: { width: 1080, height: 1920 },
  'social-card': { width: 1200, height: 675 },
  chart: { width: 1200, height: 800 },
};

export interface GenerateVisualOptions {
  narrative: string;
  tone: NarrativeTone;
  visualType: 'infographic' | 'poster' | 'social-card' | 'chart';
  dimensions?: { width: number; height: number };
  platform?: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'print';
  brandVoice?: BrandVoice | null;
  dataPoints?: Array<{ label: string; value: string | number; type: string }>;
}

export interface GenerateVisualResult {
  imageUrl: string;
  imageBase64?: string;
  prompt: string;
  model: string;
  generationTime: number;
  dimensions: { width: number; height: number };
}

/**
 * Generate visual content using Nano Banana Pro (Gemini 3 Pro Image)
 */
export async function generateVisual(
  options: GenerateVisualOptions
): Promise<GenerateVisualResult> {
  const startTime = Date.now();

  // Determine dimensions
  let dimensions = options.dimensions;
  if (!dimensions) {
    if (options.platform) {
      dimensions = PLATFORM_DIMENSIONS[options.platform];
    } else {
      dimensions = VISUAL_TYPE_DIMENSIONS[options.visualType];
    }
  }

  // Generate the image prompt using Claude
  const imagePrompt = await generateVisualPrompt({
    narrative: options.narrative,
    tone: options.tone,
    visualType: options.visualType,
    brandVoice: options.brandVoice,
    dataPoints: options.dataPoints,
  });

  // Add technical specifications to prompt
  const enhancedPrompt = `${imagePrompt}

Technical specifications:
- High quality, professional design
- Clear, legible text rendering
- ${options.visualType === 'infographic' ? 'Vertical layout with clear sections' : ''}
- ${options.visualType === 'poster' ? 'Bold headline area, balanced composition' : ''}
- ${options.visualType === 'social-card' ? 'Eye-catching, shareable design' : ''}
- ${options.visualType === 'chart' ? 'Clean data visualization with accurate proportions' : ''}
- Resolution: ${dimensions.width}x${dimensions.height}`;

  // Check if API key is configured
  if (!GOOGLE_AI_API_KEY) {
    console.warn('GOOGLE_AI_API_KEY not configured. Returning mock visual response.');
    return generateMockVisualResponse(enhancedPrompt, dimensions, startTime);
  }

  try {
    // Call Gemini 3 Pro Image API (Nano Banana Pro)
    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negativePrompt: 'blurry, low quality, distorted text, misspellings, watermark, signature',
        aspectRatio: calculateAspectRatio(dimensions),
        outputFormat: 'png',
        quality: 'high',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Nano Banana Pro API error:', errorData);
      throw new Error(`Visual generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;

    // Handle response format (may vary based on actual API)
    const imageData = data.candidates?.[0]?.content?.parts?.[0];

    return {
      imageUrl: imageData?.fileUri || '',
      imageBase64: imageData?.inlineData?.data || '',
      prompt: enhancedPrompt,
      model: 'gemini-3-pro-image-preview',
      generationTime,
      dimensions,
    };
  } catch (error) {
    console.error('Error generating visual with Nano Banana Pro:', error);

    // Return mock response in development/when API fails
    if (process.env.NODE_ENV === 'development') {
      return generateMockVisualResponse(enhancedPrompt, dimensions, startTime);
    }

    throw new Error('Failed to generate visual. Please try again.');
  }
}

/**
 * Calculate aspect ratio string from dimensions
 */
function calculateAspectRatio(dimensions: { width: number; height: number }): string {
  const { width, height } = dimensions;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Generate mock response for development/testing
 */
function generateMockVisualResponse(
  prompt: string,
  dimensions: { width: number; height: number },
  startTime: number
): GenerateVisualResult {
  return {
    imageUrl: `https://placehold.co/${dimensions.width}x${dimensions.height}/4F46E5/FFFFFF?text=Visual+Coming+Soon`,
    prompt,
    model: 'mock-gemini-3-pro-image-preview',
    generationTime: Date.now() - startTime,
    dimensions,
  };
}

/**
 * Get supported visual types with descriptions
 */
export function getVisualTypes(): Array<{
  id: string;
  name: string;
  description: string;
  defaultDimensions: { width: number; height: number };
}> {
  return [
    {
      id: 'infographic',
      name: 'Infographic',
      description: 'Vertical layout with data visualization, great for reports and social sharing',
      defaultDimensions: VISUAL_TYPE_DIMENSIONS.infographic,
    },
    {
      id: 'poster',
      name: 'Campaign Poster',
      description: 'Bold, eye-catching design for print or digital campaigns',
      defaultDimensions: VISUAL_TYPE_DIMENSIONS.poster,
    },
    {
      id: 'social-card',
      name: 'Social Media Card',
      description: 'Optimized for social media sharing with key message highlighted',
      defaultDimensions: VISUAL_TYPE_DIMENSIONS['social-card'],
    },
    {
      id: 'chart',
      name: 'Data Chart',
      description: 'Clean data visualization with narrative context',
      defaultDimensions: VISUAL_TYPE_DIMENSIONS.chart,
    },
  ];
}

/**
 * Get supported platforms with dimensions
 */
export function getPlatforms(): Array<{
  id: string;
  name: string;
  dimensions: { width: number; height: number };
}> {
  return Object.entries(PLATFORM_DIMENSIONS).map(([id, dimensions]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    dimensions,
  }));
}

export default {
  generateVisual,
  getVisualTypes,
  getPlatforms,
};
