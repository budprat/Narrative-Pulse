import api from './api';
import type {
  Narrative,
  GenerateNarrativeInput,
  NarrativeStats,
  NarrativeTone,
  PaginationMeta,
} from '@/types/api';

export interface GenerateNarrativeResult {
  narrative: Narrative;
}

export interface GetNarrativesResult {
  narratives: Narrative[];
  meta: PaginationMeta;
}

/**
 * Generate a new narrative (authenticated)
 */
export async function generateNarrative(
  input: GenerateNarrativeInput
): Promise<{ narrative: Narrative } | { error: string }> {
  const response = await api.post<Narrative>('/narratives/generate', input);

  if (response.success && response.data) {
    return { narrative: response.data };
  }

  return { error: response.error?.message || 'Failed to generate narrative' };
}

/**
 * Generate narrative demo (no auth required)
 */
export async function generateNarrativeDemo(
  input: GenerateNarrativeInput
): Promise<{ narrative: Narrative } | { error: string }> {
  const response = await api.post<Narrative>('/narratives/demo', input, false);

  if (response.success && response.data) {
    return { narrative: response.data };
  }

  return { error: response.error?.message || 'Failed to generate narrative' };
}

/**
 * Get user's narratives
 */
export async function getNarratives(params?: {
  page?: number;
  limit?: number;
  tone?: NarrativeTone;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<GetNarrativesResult | { error: string }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.tone) queryParams.set('tone', params.tone);
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

  const endpoint = `/narratives${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await api.get<Narrative[]>(endpoint);

  if (response.success && response.data) {
    return {
      narratives: response.data,
      meta: response.meta || { page: 1, limit: 20, total: response.data.length, totalPages: 1 },
    };
  }

  return { error: response.error?.message || 'Failed to fetch narratives' };
}

/**
 * Get a specific narrative
 */
export async function getNarrativeById(id: string): Promise<Narrative | { error: string }> {
  const response = await api.get<Narrative>(`/narratives/${id}`);

  if (response.success && response.data) {
    return response.data;
  }

  return { error: response.error?.message || 'Narrative not found' };
}

/**
 * Update a narrative
 */
export async function updateNarrative(
  id: string,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    outputText?: string;
    humanReviewed?: boolean;
  }
): Promise<Narrative | { error: string }> {
  const response = await api.patch<Narrative>(`/narratives/${id}`, data);

  if (response.success && response.data) {
    return response.data;
  }

  return { error: response.error?.message || 'Failed to update narrative' };
}

/**
 * Delete a narrative
 */
export async function deleteNarrative(id: string): Promise<{ success: boolean; error?: string }> {
  const response = await api.delete<{ message: string }>(`/narratives/${id}`);

  if (response.success) {
    return { success: true };
  }

  return { success: false, error: response.error?.message || 'Failed to delete narrative' };
}

/**
 * Get user's narrative statistics
 */
export async function getNarrativeStats(): Promise<NarrativeStats | { error: string }> {
  const response = await api.get<NarrativeStats>('/narratives/stats');

  if (response.success && response.data) {
    return response.data;
  }

  return { error: response.error?.message || 'Failed to fetch statistics' };
}

/**
 * Track narrative copy
 */
export async function trackCopy(id: string): Promise<void> {
  await api.post(`/narratives/${id}/copy`, {});
}

/**
 * Track narrative share
 */
export async function trackShare(id: string): Promise<void> {
  await api.post(`/narratives/${id}/share`, {});
}

export default {
  generateNarrative,
  generateNarrativeDemo,
  getNarratives,
  getNarrativeById,
  updateNarrative,
  deleteNarrative,
  getNarrativeStats,
  trackCopy,
  trackShare,
};
