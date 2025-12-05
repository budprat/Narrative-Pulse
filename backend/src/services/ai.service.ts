import Anthropic from '@anthropic-ai/sdk';
import { BrandVoice } from '@prisma/client';
import {
  NarrativeTone,
  BrandVoicePersonality,
  BrandVoiceTerminology,
  AudienceProfile,
} from '../types/index.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model to use
const MODEL = 'claude-sonnet-4-20250514';

// ============================================
// TONE SYSTEM PROMPTS
// ============================================

const TONE_PROMPTS: Record<NarrativeTone, string> = {
  activist: `You are a passionate activist communicator. Your writing style:
- Uses urgent, action-oriented language
- Appeals to emotions and shared values
- Creates a sense of immediacy and importance
- Includes clear calls to action
- Uses "we" and "us" to build solidarity
- Employs powerful, evocative imagery
- Makes the stakes clear and personal`,

  scientific: `You are a scientific communicator. Your writing style:
- Prioritizes accuracy and evidence-based claims
- Uses precise, measured language
- Cites data and research appropriately
- Maintains objectivity while being accessible
- Explains complex concepts clearly
- Avoids sensationalism or exaggeration
- Uses hedging language where appropriate (e.g., "suggests", "indicates")`,

  political: `You are a diplomatic political communicator. Your writing style:
- Balances multiple stakeholder perspectives
- Uses measured, consensus-building language
- Acknowledges complexity while providing clarity
- Emphasizes practical solutions and common ground
- Avoids partisan or divisive language
- Focuses on policy implications and outcomes
- Appeals to shared civic values`,

  inspirational: `You are an inspirational storyteller. Your writing style:
- Creates emotional resonance and connection
- Uses vivid, hopeful imagery
- Emphasizes human stories and possibilities
- Builds toward a positive vision
- Makes abstract concepts tangible and personal
- Uses metaphors and narrative techniques
- Inspires action through hope rather than fear`,
};

// ============================================
// BRAND VOICE INTEGRATION
// ============================================

function buildBrandVoicePrompt(brandVoice: BrandVoice): string {
  const personality = brandVoice.personality as BrandVoicePersonality;
  const terminology = brandVoice.terminology as BrandVoiceTerminology;
  const audienceProfiles = brandVoice.audienceProfiles as Record<string, AudienceProfile> | null;

  let prompt = `\n\n## BRAND VOICE GUIDELINES

Brand Name: ${brandVoice.name}
${brandVoice.description ? `Description: ${brandVoice.description}` : ''}

### Voice Characteristics (1-10 scale)
- Formality: ${personality.formal}/10
- Passion: ${personality.passionate}/10
- Technical depth: ${personality.technical}/10
- Empathy: ${personality.empathetic}/10

### Terminology Guidelines
`;

  if (terminology.preferred.length > 0) {
    prompt += `\nPREFERRED terms: ${terminology.preferred.join(', ')}`;
  }

  if (terminology.avoided.length > 0) {
    prompt += `\nAVOID these terms: ${terminology.avoided.join(', ')}`;
  }

  if (Object.keys(terminology.replacements).length > 0) {
    prompt += `\nWORD REPLACEMENTS:`;
    for (const [from, to] of Object.entries(terminology.replacements)) {
      prompt += `\n- Use "${to}" instead of "${from}"`;
    }
  }

  if (brandVoice.goodExamples.length > 0) {
    prompt += `\n\n### Examples of our voice (emulate this style):`;
    brandVoice.goodExamples.slice(0, 3).forEach((example, i) => {
      prompt += `\nExample ${i + 1}: "${example.substring(0, 500)}${example.length > 500 ? '...' : ''}"`;
    });
  }

  if (brandVoice.poorExamples.length > 0) {
    prompt += `\n\n### Examples to AVOID (do NOT write like this):`;
    brandVoice.poorExamples.slice(0, 2).forEach((example, i) => {
      prompt += `\nBad Example ${i + 1}: "${example.substring(0, 300)}${example.length > 300 ? '...' : ''}"`;
    });
  }

  return prompt;
}

// ============================================
// NARRATIVE GENERATION
// ============================================

export interface GenerateNarrativeOptions {
  input: string;
  tone: NarrativeTone;
  brandVoice?: BrandVoice | null;
  maxTokens?: number;
}

export interface GenerateNarrativeResult {
  narrative: string;
  modelUsed: string;
  tokenCount: number;
  generationTime: number;
}

export async function generateNarrative(
  options: GenerateNarrativeOptions
): Promise<GenerateNarrativeResult> {
  const { input, tone, brandVoice, maxTokens = 1024 } = options;
  const startTime = Date.now();

  // Build system prompt
  let systemPrompt = `You are NarrativePulse, an AI-powered narrative intelligence engine that transforms data and research into compelling stories.

${TONE_PROMPTS[tone]}

## YOUR TASK
Transform the user's input data, research findings, or information into a compelling narrative using the specified tone. The narrative should:
1. Be engaging and accessible to the target audience
2. Maintain factual accuracy while using appropriate narrative techniques
3. Have a clear structure with a beginning, middle, and end
4. Include relevant details from the input while not simply restating them
5. Be ready to use in communications, reports, or campaigns

Output ONLY the narrative text. Do not include any meta-commentary, labels, or explanations.`;

  // Add brand voice guidelines if provided
  if (brandVoice) {
    systemPrompt += buildBrandVoicePrompt(brandVoice);
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Transform the following into a ${tone} narrative:\n\n${input}`,
        },
      ],
    });

    const generationTime = Date.now() - startTime;

    // Extract text from response
    const textContent = response.content.find(block => block.type === 'text');
    const narrative = textContent ? textContent.text : '';

    return {
      narrative,
      modelUsed: MODEL,
      tokenCount: response.usage.output_tokens,
      generationTime,
    };
  } catch (error) {
    console.error('Error generating narrative:', error);
    throw new Error('Failed to generate narrative. Please try again.');
  }
}

// ============================================
// VISUAL PROMPT GENERATION
// ============================================

export interface GenerateVisualPromptOptions {
  narrative: string;
  tone: NarrativeTone;
  visualType: 'infographic' | 'poster' | 'social-card' | 'chart';
  brandVoice?: BrandVoice | null;
  dataPoints?: Array<{ label: string; value: string | number; type: string }>;
}

export async function generateVisualPrompt(
  options: GenerateVisualPromptOptions
): Promise<string> {
  const { narrative, tone, visualType, brandVoice, dataPoints } = options;

  const systemPrompt = `You are an expert at creating prompts for AI image generation, specifically for Gemini 3 Pro Image (Nano Banana Pro).

Your task is to create a detailed, effective prompt that will generate a ${visualType} based on the provided narrative.

## Guidelines for ${visualType}:
${visualType === 'infographic' ? `
- Include clear data visualization elements
- Specify layout (vertical/horizontal flow)
- Include text placeholders for key statistics
- Use professional, clean design aesthetic
- Specify color scheme that matches the tone` : ''}
${visualType === 'poster' ? `
- Create impactful, attention-grabbing design
- Include space for headline text
- Specify mood, lighting, and visual style
- Balance text and imagery areas
- Consider print dimensions and readability` : ''}
${visualType === 'social-card' ? `
- Optimize for social media engagement
- Include clear text rendering areas
- Use bold, shareable visual style
- Consider platform aspect ratios
- Make the key message immediately visible` : ''}
${visualType === 'chart' ? `
- Specify chart type (bar, line, pie, etc.)
- Include data visualization best practices
- Ensure labels and values are clearly visible
- Use appropriate visual encoding
- Include title and legend areas` : ''}

## Tone considerations for "${tone}":
${tone === 'activist' ? 'Bold colors, dynamic composition, urgent visual language' : ''}
${tone === 'scientific' ? 'Clean, precise, data-focused, neutral color palette' : ''}
${tone === 'political' ? 'Professional, balanced, inclusive imagery, institutional feel' : ''}
${tone === 'inspirational' ? 'Warm colors, hopeful imagery, human-centered, uplifting mood' : ''}

Output ONLY the image generation prompt. Make it detailed and specific.`;

  let userPrompt = `Create an image generation prompt for this narrative:\n\n"${narrative}"`;

  if (dataPoints && dataPoints.length > 0) {
    userPrompt += `\n\nData points to visualize:\n`;
    dataPoints.forEach(dp => {
      userPrompt += `- ${dp.label}: ${dp.value} (${dp.type})\n`;
    });
  }

  if (brandVoice) {
    const personality = brandVoice.personality as BrandVoicePersonality;
    userPrompt += `\n\nBrand style: ${personality.formal > 7 ? 'formal' : 'casual'}, ${personality.passionate > 7 ? 'bold and vibrant' : 'measured and calm'}`;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(block => block.type === 'text');
    return textContent ? textContent.text : '';
  } catch (error) {
    console.error('Error generating visual prompt:', error);
    throw new Error('Failed to generate visual prompt');
  }
}

// ============================================
// BRAND VOICE ANALYSIS
// ============================================

export interface AnalyzeBrandVoiceResult {
  personality: BrandVoicePersonality;
  suggestedTerminology: {
    preferred: string[];
    patterns: string[];
  };
  toneAnalysis: string;
}

export async function analyzeBrandVoiceFromExamples(
  examples: string[]
): Promise<AnalyzeBrandVoiceResult> {
  const systemPrompt = `You are an expert brand voice analyst. Analyze the provided content examples to extract the brand's voice characteristics.

Output a JSON object with the following structure:
{
  "personality": {
    "formal": <1-10>,
    "passionate": <1-10>,
    "technical": <1-10>,
    "empathetic": <1-10>
  },
  "suggestedTerminology": {
    "preferred": ["term1", "term2", ...],
    "patterns": ["pattern description 1", ...]
  },
  "toneAnalysis": "Brief description of the overall voice and tone"
}

Output ONLY valid JSON, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze these content examples to extract brand voice characteristics:\n\n${examples.map((e, i) => `Example ${i + 1}:\n"${e}"\n`).join('\n')}`,
        },
      ],
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No response from AI');
    }

    return JSON.parse(textContent.text) as AnalyzeBrandVoiceResult;
  } catch (error) {
    console.error('Error analyzing brand voice:', error);
    throw new Error('Failed to analyze brand voice from examples');
  }
}

export default {
  generateNarrative,
  generateVisualPrompt,
  analyzeBrandVoiceFromExamples,
};
