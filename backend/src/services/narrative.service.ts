import { Narrative, Prisma } from '@prisma/client';
import prisma from './prisma.js';
import { generateNarrative as aiGenerateNarrative } from './ai.service.js';
import { generateVisual } from './visual.service.js';
import { hashInput } from '../utils/hash.js';
import {
  NarrativeTone,
  GenerateNarrativeResponse,
  EditRecord,
  PaginationParams,
} from '../types/index.js';

// ============================================
// NARRATIVE GENERATION
// ============================================

export interface CreateNarrativeInput {
  userId: string;
  organizationId?: string;
  inputText: string;
  tone: NarrativeTone;
  brandVoiceId?: string;
  generateVisual?: boolean;
  visualType?: 'infographic' | 'poster' | 'social-card';
}

export async function createNarrative(
  input: CreateNarrativeInput
): Promise<GenerateNarrativeResponse> {
  const {
    userId,
    organizationId,
    inputText,
    tone,
    brandVoiceId,
    generateVisual: shouldGenerateVisual,
    visualType,
  } = input;

  // Get brand voice if provided
  let brandVoice = null;
  if (brandVoiceId) {
    brandVoice = await prisma.brandVoice.findUnique({
      where: { id: brandVoiceId },
    });
  }

  // Generate narrative using AI
  const aiResult = await aiGenerateNarrative({
    input: inputText,
    tone,
    brandVoice,
  });

  // Generate source data hash for provenance
  const sourceDataHash = hashInput(inputText);

  // Create narrative record
  const narrative = await prisma.narrative.create({
    data: {
      userId,
      organizationId,
      inputText,
      outputText: aiResult.narrative,
      tone,
      modelUsed: aiResult.modelUsed,
      generationTime: aiResult.generationTime,
      tokenCount: aiResult.tokenCount,
      sourceDataHash,
      brandVoiceId,
      hasVisual: false,
    },
  });

  // Generate visual if requested
  let visualUrl: string | undefined;
  if (shouldGenerateVisual && visualType) {
    try {
      const visualResult = await generateVisual({
        narrative: aiResult.narrative,
        tone,
        visualType,
        brandVoice,
      });

      // Update narrative with visual info
      await prisma.narrative.update({
        where: { id: narrative.id },
        data: {
          hasVisual: true,
          visualUrl: visualResult.imageUrl,
          visualPrompt: visualResult.prompt,
          visualModel: visualResult.model,
        },
      });

      visualUrl = visualResult.imageUrl;
    } catch (error) {
      console.error('Visual generation failed:', error);
      // Don't fail the whole request if visual fails
    }
  }

  // Create initial analytics record
  await prisma.narrativeAnalytics.create({
    data: {
      narrativeId: narrative.id,
    },
  });

  return {
    id: narrative.id,
    inputText: narrative.inputText,
    outputText: narrative.outputText,
    tone: narrative.tone as NarrativeTone,
    modelUsed: narrative.modelUsed,
    generationTime: narrative.generationTime || 0,
    tokenCount: narrative.tokenCount || undefined,
    sourceDataHash: narrative.sourceDataHash || '',
    hasVisual: !!visualUrl,
    visualUrl,
    createdAt: narrative.createdAt,
  };
}

// ============================================
// NARRATIVE RETRIEVAL
// ============================================

export interface GetNarrativesInput {
  userId: string;
  organizationId?: string;
  tone?: NarrativeTone;
  pagination: PaginationParams;
}

export async function getNarratives(input: GetNarrativesInput) {
  const { userId, organizationId, tone, pagination } = input;
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

  const where: Prisma.NarrativeWhereInput = {
    userId,
    ...(organizationId && { organizationId }),
    ...(tone && { tone }),
  };

  const [narratives, total] = await Promise.all([
    prisma.narrative.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        brandVoice: {
          select: {
            id: true,
            name: true,
          },
        },
        analytics: true,
      },
    }),
    prisma.narrative.count({ where }),
  ]);

  return {
    narratives,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getNarrativeById(id: string, userId: string) {
  const narrative = await prisma.narrative.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      brandVoice: true,
      analytics: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!narrative) {
    throw new Error('Narrative not found');
  }

  return narrative;
}

// ============================================
// NARRATIVE UPDATES
// ============================================

export interface UpdateNarrativeInput {
  title?: string;
  description?: string;
  tags?: string[];
  outputText?: string;
  humanReviewed?: boolean;
  reviewedBy?: string;
}

export async function updateNarrative(
  id: string,
  userId: string,
  input: UpdateNarrativeInput
) {
  // Get existing narrative
  const existing = await prisma.narrative.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Narrative not found');
  }

  // Build edit history entry if outputText is changed
  let editHistory = (existing.editHistory as EditRecord[]) || [];
  if (input.outputText && input.outputText !== existing.outputText) {
    editHistory.push({
      editedAt: new Date(),
      editedBy: userId,
      fieldChanged: 'outputText',
      previousValue: existing.outputText.substring(0, 100) + '...',
    });
  }

  // Update narrative
  const updated = await prisma.narrative.update({
    where: { id },
    data: {
      ...input,
      editHistory,
      ...(input.humanReviewed && { reviewedAt: new Date() }),
    },
    include: {
      brandVoice: true,
      analytics: true,
    },
  });

  return updated;
}

export async function deleteNarrative(id: string, userId: string) {
  const narrative = await prisma.narrative.findFirst({
    where: { id, userId },
  });

  if (!narrative) {
    throw new Error('Narrative not found');
  }

  await prisma.narrative.delete({
    where: { id },
  });

  return { success: true };
}

// ============================================
// ANALYTICS TRACKING
// ============================================

export async function trackNarrativeView(id: string) {
  await prisma.narrativeAnalytics.update({
    where: { narrativeId: id },
    data: {
      views: { increment: 1 },
    },
  });
}

export async function trackNarrativeCopy(id: string) {
  await prisma.narrativeAnalytics.update({
    where: { narrativeId: id },
    data: {
      copies: { increment: 1 },
    },
  });
}

export async function trackNarrativeShare(id: string) {
  await prisma.narrativeAnalytics.update({
    where: { narrativeId: id },
    data: {
      shares: { increment: 1 },
    },
  });
}

export async function trackNarrativeExport(id: string) {
  await prisma.narrativeAnalytics.update({
    where: { narrativeId: id },
    data: {
      exports: { increment: 1 },
    },
  });
}

// ============================================
// USER STATISTICS
// ============================================

export async function getUserNarrativeStats(userId: string) {
  const [totalNarratives, toneBreakdown, recentActivity] = await Promise.all([
    prisma.narrative.count({ where: { userId } }),
    prisma.narrative.groupBy({
      by: ['tone'],
      where: { userId },
      _count: true,
    }),
    prisma.narrative.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        tone: true,
        createdAt: true,
        hasVisual: true,
      },
    }),
  ]);

  return {
    totalNarratives,
    toneBreakdown: toneBreakdown.reduce(
      (acc, item) => {
        acc[item.tone] = item._count;
        return acc;
      },
      {} as Record<string, number>
    ),
    recentActivity,
  };
}

export default {
  createNarrative,
  getNarratives,
  getNarrativeById,
  updateNarrative,
  deleteNarrative,
  trackNarrativeView,
  trackNarrativeCopy,
  trackNarrativeShare,
  trackNarrativeExport,
  getUserNarrativeStats,
};
