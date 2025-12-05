import { Request } from 'express';
import { User, BrandVoice, Organization } from '@prisma/client';

// ============================================
// EXPRESS EXTENSIONS
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationType?: string;
  organizationName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  organizationId: string | null;
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
  createdAt: Date;
}

// ============================================
// NARRATIVE TYPES
// ============================================

export type NarrativeTone = 'activist' | 'scientific' | 'political' | 'inspirational';

export interface GenerateNarrativeInput {
  input: string;
  tone: NarrativeTone;
  brandVoiceId?: string;
  generateVisual?: boolean;
  visualType?: 'infographic' | 'poster' | 'social-card';
}

export interface GenerateNarrativeResponse {
  id: string;
  inputText: string;
  outputText: string;
  tone: NarrativeTone;
  modelUsed: string;
  generationTime: number;
  tokenCount?: number;
  sourceDataHash: string;
  hasVisual: boolean;
  visualUrl?: string;
  createdAt: Date;
}

export interface NarrativeWithProvenance {
  id: string;
  outputText: string;
  tone: NarrativeTone;
  provenance: {
    modelUsed: string;
    generatedAt: Date;
    humanReviewed: boolean;
    reviewedBy?: string;
    sourceDataHash: string;
    editHistory: EditRecord[];
  };
}

export interface EditRecord {
  editedAt: Date;
  editedBy: string;
  fieldChanged: string;
  previousValue?: string;
}

// ============================================
// BRAND VOICE TYPES
// ============================================

export interface BrandVoicePersonality {
  formal: number;      // 1-10 scale
  passionate: number;
  technical: number;
  empathetic: number;
}

export interface BrandVoiceTerminology {
  preferred: string[];
  avoided: string[];
  replacements: Record<string, string>;
}

export interface AudienceProfile {
  name: string;
  toneAdjustments: Partial<BrandVoicePersonality>;
  additionalGuidelines: string[];
}

export interface CreateBrandVoiceInput {
  name: string;
  description?: string;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  audienceProfiles?: Record<string, AudienceProfile>;
  goodExamples?: string[];
  poorExamples?: string[];
}

export interface BrandVoiceResponse {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  audienceProfiles: Record<string, AudienceProfile> | null;
  goodExamples: string[];
  poorExamples: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// VISUAL GENERATION TYPES
// ============================================

export interface GenerateVisualInput {
  narrativeId?: string;
  narrative: string;
  tone: NarrativeTone;
  visualType: 'infographic' | 'poster' | 'social-card' | 'chart';
  dimensions?: {
    width: number;
    height: number;
  };
  platform?: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'print';
  brandVoiceId?: string;
  dataPoints?: DataPoint[];
}

export interface DataPoint {
  label: string;
  value: number | string;
  type: 'number' | 'percentage' | 'text';
}

export interface GenerateVisualResponse {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  generationTime: number;
  dimensions: {
    width: number;
    height: number;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
