import { z } from 'zod';

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  organizationType: z.enum([
    'NGO',
    'POLITICAL_CAMPAIGN',
    'ADVOCACY_GROUP',
    'GOVERNMENT',
    'RESEARCH_INSTITUTION',
    'MEDIA',
    'ENTERPRISE',
    'OTHER'
  ]).optional(),
  organizationName: z.string().min(2).max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// NARRATIVE VALIDATION SCHEMAS
// ============================================

export const narrativeToneSchema = z.enum(['activist', 'scientific', 'political', 'inspirational']);

export const generateNarrativeSchema = z.object({
  input: z
    .string()
    .min(10, 'Input must be at least 10 characters')
    .max(10000, 'Input must not exceed 10,000 characters')
    .refine(val => val.trim().length > 0, 'Input cannot be empty'),
  tone: narrativeToneSchema,
  brandVoiceId: z.string().cuid().optional(),
  generateVisual: z.boolean().optional().default(false),
  visualType: z.enum(['infographic', 'poster', 'social-card']).optional(),
});

export const updateNarrativeSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  outputText: z.string().max(50000).optional(),
  humanReviewed: z.boolean().optional(),
});

// ============================================
// BRAND VOICE VALIDATION SCHEMAS
// ============================================

export const brandVoicePersonalitySchema = z.object({
  formal: z.number().min(1).max(10),
  passionate: z.number().min(1).max(10),
  technical: z.number().min(1).max(10),
  empathetic: z.number().min(1).max(10),
});

export const brandVoiceTerminologySchema = z.object({
  preferred: z.array(z.string().max(100)).max(50),
  avoided: z.array(z.string().max(100)).max(50),
  replacements: z.record(z.string().max(100), z.string().max(100)),
});

export const audienceProfileSchema = z.object({
  name: z.string().min(1).max(50),
  toneAdjustments: brandVoicePersonalitySchema.partial(),
  additionalGuidelines: z.array(z.string().max(500)).max(10),
});

export const createBrandVoiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  personality: brandVoicePersonalitySchema,
  terminology: brandVoiceTerminologySchema,
  audienceProfiles: z.record(z.string(), audienceProfileSchema).optional(),
  goodExamples: z.array(z.string().max(2000)).max(10).optional(),
  poorExamples: z.array(z.string().max(2000)).max(10).optional(),
});

export const updateBrandVoiceSchema = createBrandVoiceSchema.partial();

// ============================================
// VISUAL GENERATION VALIDATION SCHEMAS
// ============================================

export const generateVisualSchema = z.object({
  narrativeId: z.string().cuid().optional(),
  narrative: z.string().min(10).max(5000),
  tone: narrativeToneSchema,
  visualType: z.enum(['infographic', 'poster', 'social-card', 'chart']),
  dimensions: z.object({
    width: z.number().min(256).max(4096),
    height: z.number().min(256).max(4096),
  }).optional(),
  platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin', 'print']).optional(),
  brandVoiceId: z.string().cuid().optional(),
  dataPoints: z.array(z.object({
    label: z.string().max(100),
    value: z.union([z.number(), z.string()]),
    type: z.enum(['number', 'percentage', 'text']),
  })).max(20).optional(),
});

// ============================================
// PAGINATION VALIDATION
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateNarrativeInput = z.infer<typeof generateNarrativeSchema>;
export type UpdateNarrativeInput = z.infer<typeof updateNarrativeSchema>;
export type CreateBrandVoiceInput = z.infer<typeof createBrandVoiceSchema>;
export type UpdateBrandVoiceInput = z.infer<typeof updateBrandVoiceSchema>;
export type GenerateVisualInput = z.infer<typeof generateVisualSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
