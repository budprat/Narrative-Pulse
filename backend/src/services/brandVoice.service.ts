import { BrandVoice, Prisma } from '@prisma/client';
import prisma from './prisma.js';
import { analyzeBrandVoiceFromExamples } from './ai.service.js';
import {
  BrandVoicePersonality,
  BrandVoiceTerminology,
  AudienceProfile,
  BrandVoiceResponse,
  PaginationParams,
} from '../types/index.js';

// ============================================
// BRAND VOICE CREATION
// ============================================

export interface CreateBrandVoiceInput {
  userId: string;
  organizationId?: string;
  name: string;
  description?: string;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  audienceProfiles?: Record<string, AudienceProfile>;
  goodExamples?: string[];
  poorExamples?: string[];
  isDefault?: boolean;
}

function formatBrandVoiceResponse(brandVoice: BrandVoice): BrandVoiceResponse {
  return {
    id: brandVoice.id,
    name: brandVoice.name,
    description: brandVoice.description,
    isDefault: brandVoice.isDefault,
    personality: brandVoice.personality as BrandVoicePersonality,
    terminology: brandVoice.terminology as BrandVoiceTerminology,
    audienceProfiles: brandVoice.audienceProfiles as Record<string, AudienceProfile> | null,
    goodExamples: brandVoice.goodExamples,
    poorExamples: brandVoice.poorExamples,
    createdAt: brandVoice.createdAt,
    updatedAt: brandVoice.updatedAt,
  };
}

export async function createBrandVoice(
  input: CreateBrandVoiceInput
): Promise<BrandVoiceResponse> {
  const {
    userId,
    organizationId,
    name,
    description,
    personality,
    terminology,
    audienceProfiles,
    goodExamples = [],
    poorExamples = [],
    isDefault = false,
  } = input;

  // If setting as default, unset other defaults for this user/org
  if (isDefault) {
    await prisma.brandVoice.updateMany({
      where: {
        userId,
        organizationId,
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  const brandVoice = await prisma.brandVoice.create({
    data: {
      name,
      description,
      userId,
      organizationId,
      personality,
      terminology,
      audienceProfiles,
      goodExamples,
      poorExamples,
      isDefault,
    },
  });

  return formatBrandVoiceResponse(brandVoice);
}

// ============================================
// BRAND VOICE RETRIEVAL
// ============================================

export interface GetBrandVoicesInput {
  userId: string;
  organizationId?: string;
  pagination?: PaginationParams;
}

export async function getBrandVoices(input: GetBrandVoicesInput) {
  const { userId, organizationId, pagination } = input;
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {};

  const where: Prisma.BrandVoiceWhereInput = {
    OR: [
      { userId },
      ...(organizationId ? [{ organizationId }] : []),
    ],
  };

  const [brandVoices, total] = await Promise.all([
    prisma.brandVoice.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brandVoice.count({ where }),
  ]);

  return {
    brandVoices: brandVoices.map(formatBrandVoiceResponse),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBrandVoiceById(
  id: string,
  userId: string
): Promise<BrandVoiceResponse> {
  const brandVoice = await prisma.brandVoice.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { organization: { users: { some: { id: userId } } } },
      ],
    },
  });

  if (!brandVoice) {
    throw new Error('Brand voice not found');
  }

  return formatBrandVoiceResponse(brandVoice);
}

export async function getDefaultBrandVoice(
  userId: string,
  organizationId?: string
): Promise<BrandVoiceResponse | null> {
  const brandVoice = await prisma.brandVoice.findFirst({
    where: {
      isDefault: true,
      OR: [
        { userId },
        ...(organizationId ? [{ organizationId }] : []),
      ],
    },
  });

  return brandVoice ? formatBrandVoiceResponse(brandVoice) : null;
}

// ============================================
// BRAND VOICE UPDATES
// ============================================

export interface UpdateBrandVoiceInput {
  name?: string;
  description?: string;
  personality?: BrandVoicePersonality;
  terminology?: BrandVoiceTerminology;
  audienceProfiles?: Record<string, AudienceProfile>;
  goodExamples?: string[];
  poorExamples?: string[];
  isDefault?: boolean;
}

export async function updateBrandVoice(
  id: string,
  userId: string,
  input: UpdateBrandVoiceInput
): Promise<BrandVoiceResponse> {
  // Verify ownership
  const existing = await prisma.brandVoice.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { organization: { users: { some: { id: userId } } } },
      ],
    },
  });

  if (!existing) {
    throw new Error('Brand voice not found');
  }

  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.brandVoice.updateMany({
      where: {
        userId: existing.userId,
        organizationId: existing.organizationId,
        isDefault: true,
        NOT: { id },
      },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.brandVoice.update({
    where: { id },
    data: input,
  });

  return formatBrandVoiceResponse(updated);
}

export async function deleteBrandVoice(id: string, userId: string) {
  const brandVoice = await prisma.brandVoice.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { organization: { users: { some: { id: userId } } } },
      ],
    },
  });

  if (!brandVoice) {
    throw new Error('Brand voice not found');
  }

  await prisma.brandVoice.delete({
    where: { id },
  });

  return { success: true };
}

// ============================================
// BRAND VOICE ANALYSIS (AI-Powered)
// ============================================

export interface AnalyzeExamplesInput {
  userId: string;
  examples: string[];
  name?: string;
}

export async function analyzeAndCreateBrandVoice(
  input: AnalyzeExamplesInput
): Promise<BrandVoiceResponse> {
  const { userId, examples, name } = input;

  if (examples.length < 2) {
    throw new Error('At least 2 content examples are required for analysis');
  }

  // Analyze examples using AI
  const analysis = await analyzeBrandVoiceFromExamples(examples);

  // Create brand voice from analysis
  const brandVoice = await createBrandVoice({
    userId,
    name: name || 'Analyzed Brand Voice',
    description: analysis.toneAnalysis,
    personality: analysis.personality,
    terminology: {
      preferred: analysis.suggestedTerminology.preferred,
      avoided: [],
      replacements: {},
    },
    goodExamples: examples,
    poorExamples: [],
  });

  return brandVoice;
}

// ============================================
// BRAND VOICE TEMPLATES
// ============================================

export function getBrandVoiceTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  forOrganizationType: string[];
}> {
  return [
    {
      id: 'ngo-compassionate',
      name: 'Compassionate NGO',
      description: 'Warm, empathetic voice focused on human impact',
      personality: { formal: 5, passionate: 8, technical: 3, empathetic: 9 },
      terminology: {
        preferred: ['community', 'impact', 'together', 'support', 'empower'],
        avoided: ['victims', 'helpless', 'charity'],
        replacements: { 'poor people': 'communities in need', 'third world': 'developing regions' },
      },
      forOrganizationType: ['NGO', 'ADVOCACY_GROUP'],
    },
    {
      id: 'policy-expert',
      name: 'Policy Expert',
      description: 'Authoritative, evidence-based voice for policy advocacy',
      personality: { formal: 8, passionate: 5, technical: 8, empathetic: 5 },
      terminology: {
        preferred: ['research indicates', 'evidence suggests', 'policy implications'],
        avoided: ['I think', 'probably', 'maybe'],
        replacements: { 'shows': 'demonstrates', 'proves': 'indicates' },
      },
      forOrganizationType: ['RESEARCH_INSTITUTION', 'GOVERNMENT'],
    },
    {
      id: 'campaign-energetic',
      name: 'Campaign Energetic',
      description: 'Dynamic, motivating voice for political campaigns',
      personality: { formal: 4, passionate: 9, technical: 3, empathetic: 7 },
      terminology: {
        preferred: ['movement', 'change', 'future', 'together', 'action'],
        avoided: ['attack', 'destroy', 'enemy'],
        replacements: { 'opponent': 'alternative candidate', 'fight against': 'advocate for' },
      },
      forOrganizationType: ['POLITICAL_CAMPAIGN', 'ADVOCACY_GROUP'],
    },
    {
      id: 'science-communicator',
      name: 'Science Communicator',
      description: 'Clear, accessible voice for scientific topics',
      personality: { formal: 6, passionate: 6, technical: 7, empathetic: 5 },
      terminology: {
        preferred: ['research shows', 'scientists have found', 'evidence indicates'],
        avoided: ['proves', 'definitely', 'always', 'never'],
        replacements: { 'fact': 'finding', 'truth': 'evidence' },
      },
      forOrganizationType: ['RESEARCH_INSTITUTION', 'MEDIA'],
    },
  ];
}

export async function createFromTemplate(
  templateId: string,
  userId: string,
  organizationId?: string,
  customName?: string
): Promise<BrandVoiceResponse> {
  const templates = getBrandVoiceTemplates();
  const template = templates.find(t => t.id === templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  return createBrandVoice({
    userId,
    organizationId,
    name: customName || template.name,
    description: template.description,
    personality: template.personality,
    terminology: template.terminology,
    goodExamples: [],
    poorExamples: [],
  });
}

export default {
  createBrandVoice,
  getBrandVoices,
  getBrandVoiceById,
  getDefaultBrandVoice,
  updateBrandVoice,
  deleteBrandVoice,
  analyzeAndCreateBrandVoice,
  getBrandVoiceTemplates,
  createFromTemplate,
};
