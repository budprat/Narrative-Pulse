import { Router, Response } from 'express';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  generateNarrativeSchema,
  updateNarrativeSchema,
  paginationSchema,
} from '../utils/validation.js';
import narrativeService from '../services/narrative.service.js';

const router = Router();

/**
 * POST /api/narratives/generate
 * Generate a new narrative
 */
router.post(
  '/generate',
  authenticateToken,
  validateBody(generateNarrativeSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const { input, tone, brandVoiceId, generateVisual, visualType } = req.body;

      const narrative = await narrativeService.createNarrative({
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        inputText: input,
        tone,
        brandVoiceId,
        generateVisual,
        visualType,
      });

      res.status(201).json({
        success: true,
        data: narrative,
      });
    } catch (error) {
      console.error('Narrative generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate narrative';
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message,
        },
      });
    }
  }
);

/**
 * POST /api/narratives/demo
 * Demo generation (no auth required, limited features)
 */
router.post(
  '/demo',
  optionalAuth,
  validateBody(generateNarrativeSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { input, tone } = req.body;

      // For demo, use a system user or generate without saving
      // Import the AI service directly for demo
      const { generateNarrative } = await import('../services/ai.service.js');
      const { hashInput } = await import('../utils/hash.js');

      const result = await generateNarrative({
        input,
        tone,
        brandVoice: null,
        maxTokens: 512, // Limited for demo
      });

      res.json({
        success: true,
        data: {
          id: 'demo-' + Date.now(),
          inputText: input,
          outputText: result.narrative,
          tone,
          modelUsed: result.modelUsed,
          generationTime: result.generationTime,
          tokenCount: result.tokenCount,
          sourceDataHash: hashInput(input),
          hasVisual: false,
          createdAt: new Date(),
          isDemo: true,
        },
      });
    } catch (error) {
      console.error('Demo generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate narrative';
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message,
        },
      });
    }
  }
);

/**
 * GET /api/narratives
 * Get user's narratives
 */
router.get(
  '/',
  authenticateToken,
  validateQuery(paginationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const { tone } = req.query;
      const pagination = req.query as any;

      const result = await narrativeService.getNarratives({
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        tone: tone as any,
        pagination,
      });

      res.json({
        success: true,
        data: result.narratives,
        meta: result.meta,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch narratives' },
      });
    }
  }
);

/**
 * GET /api/narratives/stats
 * Get user's narrative statistics
 */
router.get(
  '/stats',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const stats = await narrativeService.getUserNarrativeStats(req.user.userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch statistics' },
      });
    }
  }
);

/**
 * GET /api/narratives/:id
 * Get a specific narrative
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const narrative = await narrativeService.getNarrativeById(
        req.params.id,
        req.user.userId
      );

      // Track view
      await narrativeService.trackNarrativeView(req.params.id);

      res.json({
        success: true,
        data: narrative,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Narrative not found';
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }
  }
);

/**
 * PATCH /api/narratives/:id
 * Update a narrative
 */
router.patch(
  '/:id',
  authenticateToken,
  validateBody(updateNarrativeSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const narrative = await narrativeService.updateNarrative(
        req.params.id,
        req.user.userId,
        req.body
      );

      res.json({
        success: true,
        data: narrative,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update narrative';
      res.status(400).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message },
      });
    }
  }
);

/**
 * DELETE /api/narratives/:id
 * Delete a narrative
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      await narrativeService.deleteNarrative(req.params.id, req.user.userId);

      res.json({
        success: true,
        data: { message: 'Narrative deleted successfully' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete narrative';
      res.status(400).json({
        success: false,
        error: { code: 'DELETE_FAILED', message },
      });
    }
  }
);

/**
 * POST /api/narratives/:id/copy
 * Track narrative copy
 */
router.post(
  '/:id/copy',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await narrativeService.trackNarrativeCopy(req.params.id);
      res.json({ success: true });
    } catch {
      res.json({ success: true }); // Don't fail on tracking errors
    }
  }
);

/**
 * POST /api/narratives/:id/share
 * Track narrative share
 */
router.post(
  '/:id/share',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await narrativeService.trackNarrativeShare(req.params.id);
      res.json({ success: true });
    } catch {
      res.json({ success: true }); // Don't fail on tracking errors
    }
  }
);

export default router;
