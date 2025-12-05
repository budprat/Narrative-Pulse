// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface User {
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
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

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

export interface Narrative {
  id: string;
  inputText: string;
  outputText: string;
  tone: NarrativeTone;
  title?: string;
  description?: string;
  tags?: string[];
  modelUsed: string;
  generationTime: number;
  tokenCount?: number;
  sourceDataHash: string;
  humanReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  editHistory?: EditRecord[];
  hasVisual: boolean;
  visualUrl?: string;
  visualPrompt?: string;
  visualModel?: string;
  brandVoice?: {
    id: string;
    name: string;
  } | null;
  analytics?: NarrativeAnalytics;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface NarrativeAnalytics {
  views: number;
  shares: number;
  copies: number;
  exports: number;
  rating?: number;
  feedbackCount: number;
}

export interface EditRecord {
  editedAt: string;
  editedBy: string;
  fieldChanged: string;
  previousValue?: string;
}

export interface NarrativeStats {
  totalNarratives: number;
  toneBreakdown: Record<NarrativeTone, number>;
  recentActivity: Array<{
    id: string;
    tone: NarrativeTone;
    createdAt: string;
    hasVisual: boolean;
  }>;
}

// ============================================
// BRAND VOICE TYPES
// ============================================

export interface BrandVoicePersonality {
  formal: number;
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

export interface BrandVoice {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  audienceProfiles: Record<string, AudienceProfile> | null;
  goodExamples: string[];
  poorExamples: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandVoiceTemplate {
  id: string;
  name: string;
  description: string;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  forOrganizationType: string[];
}

export interface CreateBrandVoiceInput {
  name: string;
  description?: string;
  personality: BrandVoicePersonality;
  terminology: BrandVoiceTerminology;
  audienceProfiles?: Record<string, AudienceProfile>;
  goodExamples?: string[];
  poorExamples?: string[];
  isDefault?: boolean;
}

// ============================================
// VISUAL TYPES
// ============================================

export interface VisualType {
  id: string;
  name: string;
  description: string;
  defaultDimensions: {
    width: number;
    height: number;
  };
}

export interface Platform {
  id: string;
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
}

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

export interface GeneratedVisual {
  id: string;
  imageUrl: string;
  imageBase64?: string;
  prompt: string;
  model: string;
  generationTime: number;
  dimensions: {
    width: number;
    height: number;
  };
}
