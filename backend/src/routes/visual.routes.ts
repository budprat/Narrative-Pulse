import { Router, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { generateVisualSchema } from '../utils/validation.js';
import visualService from '../services/visual.service.js';
import prisma from '../services/prisma.js';

const router = Router();

/**
 * GET /api/visuals/types
 * Get available visual types
 */
router.get('/types', (_req, res: Response) => {
  const types = visualService.getVisualTypes();
  res.json({
    success: true,
    data: types,
  });
});

/**
 * GET /api/visuals/platforms
 * Get supported platforms with dimensions
 */
router.get('/platforms', (_req, res: Response) => {
  const platforms = visualService.getPlatforms();
  res.json({
    success: true,
    data: platforms,
  });
});

/**
 * POST /api/visuals/generate
 * Generate a visual from narrative
 */
router.post(
  '/generate',
  authenticateToken,
  validateBody(generateVisualSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const {
        narrativeId,
        narrative,
        tone,
        visualType,
        dimensions,
        platform,
        brandVoiceId,
        dataPoints,
      } = req.body;

      // Get brand voice if provided
      let brandVoice = null;
      if (brandVoiceId) {
        brandVoice = await prisma.brandVoice.findUnique({
          where: { id: brandVoiceId },
        });
      }

      const result = await visualService.generateVisual({
        narrative,
        tone,
        visualType,
        dimensions,
        platform,
        brandVoice,
        dataPoints,
      });

      // If narrativeId provided, update the narrative with visual info
      if (narrativeId) {
        try {
          await prisma.narrative.update({
            where: {
              id: narrativeId,
              userId: req.user.userId,
            },
            data: {
              hasVisual: true,
              visualUrl: result.imageUrl,
              visualPrompt: result.prompt,
              visualModel: result.model,
            },
          });
        } catch {
          // Narrative update failed, but visual was generated
          console.warn('Failed to update narrative with visual info');
        }
      }

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Visual generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate visual';
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
 * POST /api/visuals/regenerate/:narrativeId
 * Regenerate visual for an existing narrative
 */
router.post(
  '/regenerate/:narrativeId',
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

      const { narrativeId } = req.params;
      const { visualType = 'social-card', platform } = req.body;

      // Get the narrative
      const narrative = await prisma.narrative.findFirst({
        where: {
          id: narrativeId,
          userId: req.user.userId,
        },
        include: {
          brandVoice: true,
        },
      });

      if (!narrative) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Narrative not found' },
        });
        return;
      }

      // Generate new visual
      const result = await visualService.generateVisual({
        narrative: narrative.outputText,
        tone: narrative.tone as any,
        visualType,
        platform,
        brandVoice: narrative.brandVoice,
      });

      // Update narrative
      await prisma.narrative.update({
        where: { id: narrativeId },
        data: {
          hasVisual: true,
          visualUrl: result.imageUrl,
          visualPrompt: result.prompt,
          visualModel: result.model,
        },
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Visual regeneration error:', error);
      const message = error instanceof Error ? error.message : 'Failed to regenerate visual';
      res.status(500).json({
        success: false,
        error: {
          code: 'REGENERATION_FAILED',
          message,
        },
      });
    }
  }
);

export default router;
