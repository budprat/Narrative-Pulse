import { Router, Response } from 'express';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  createBrandVoiceSchema,
  updateBrandVoiceSchema,
  paginationSchema,
} from '../utils/validation.js';
import brandVoiceService from '../services/brandVoice.service.js';

const router = Router();

/**
 * GET /api/brand-voices/templates
 * Get available brand voice templates
 */
router.get('/templates', (_req, res: Response) => {
  const templates = brandVoiceService.getBrandVoiceTemplates();
  res.json({
    success: true,
    data: templates,
  });
});

/**
 * POST /api/brand-voices
 * Create a new brand voice
 */
router.post(
  '/',
  authenticateToken,
  validateBody(createBrandVoiceSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const brandVoice = await brandVoiceService.createBrandVoice({
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        data: brandVoice,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create brand voice';
      res.status(400).json({
        success: false,
        error: { code: 'CREATE_FAILED', message },
      });
    }
  }
);

/**
 * POST /api/brand-voices/analyze
 * Analyze content examples to create brand voice
 */
router.post(
  '/analyze',
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

      const { examples, name } = req.body;

      if (!examples || !Array.isArray(examples) || examples.length < 2) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least 2 content examples are required',
          },
        });
        return;
      }

      const brandVoice = await brandVoiceService.analyzeAndCreateBrandVoice({
        userId: req.user.userId,
        examples,
        name,
      });

      res.status(201).json({
        success: true,
        data: brandVoice,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze brand voice';
      res.status(400).json({
        success: false,
        error: { code: 'ANALYSIS_FAILED', message },
      });
    }
  }
);

/**
 * POST /api/brand-voices/from-template
 * Create brand voice from template
 */
router.post(
  '/from-template',
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

      const { templateId, name } = req.body;

      if (!templateId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Template ID is required' },
        });
        return;
      }

      const brandVoice = await brandVoiceService.createFromTemplate(
        templateId,
        req.user.userId,
        req.user.organizationId,
        name
      );

      res.status(201).json({
        success: true,
        data: brandVoice,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create from template';
      res.status(400).json({
        success: false,
        error: { code: 'CREATE_FAILED', message },
      });
    }
  }
);

/**
 * GET /api/brand-voices
 * Get user's brand voices
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

      const result = await brandVoiceService.getBrandVoices({
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        pagination: req.query as any,
      });

      res.json({
        success: true,
        data: result.brandVoices,
        meta: result.meta,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch brand voices' },
      });
    }
  }
);

/**
 * GET /api/brand-voices/default
 * Get default brand voice
 */
router.get(
  '/default',
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

      const brandVoice = await brandVoiceService.getDefaultBrandVoice(
        req.user.userId,
        req.user.organizationId
      );

      res.json({
        success: true,
        data: brandVoice,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch default brand voice' },
      });
    }
  }
);

/**
 * GET /api/brand-voices/:id
 * Get a specific brand voice
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

      const brandVoice = await brandVoiceService.getBrandVoiceById(
        req.params.id,
        req.user.userId
      );

      res.json({
        success: true,
        data: brandVoice,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Brand voice not found';
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }
  }
);

/**
 * PATCH /api/brand-voices/:id
 * Update a brand voice
 */
router.patch(
  '/:id',
  authenticateToken,
  validateBody(updateBrandVoiceSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      const brandVoice = await brandVoiceService.updateBrandVoice(
        req.params.id,
        req.user.userId,
        req.body
      );

      res.json({
        success: true,
        data: brandVoice,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update brand voice';
      res.status(400).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message },
      });
    }
  }
);

/**
 * DELETE /api/brand-voices/:id
 * Delete a brand voice
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

      await brandVoiceService.deleteBrandVoice(req.params.id, req.user.userId);

      res.json({
        success: true,
        data: { message: 'Brand voice deleted successfully' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete brand voice';
      res.status(400).json({
        success: false,
        error: { code: 'DELETE_FAILED', message },
      });
    }
  }
);

export default router;
