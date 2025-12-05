import { Router, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../utils/validation.js';
import authService from '../services/auth.service.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req, res: Response) => {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message,
        },
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req, res: Response) => {
    try {
      const result = await authService.login(req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message,
        },
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  async (req, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message,
        },
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', async (req, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get(
  '/me',
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

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get user' },
      });
    }
  }
);

/**
 * PATCH /api/auth/profile
 * Update user profile
 */
router.patch(
  '/profile',
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

      const { name, avatar } = req.body;
      const user = await authService.updateProfile(req.user.userId, { name, avatar });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update profile' },
      });
    }
  }
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
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

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Current and new password required' },
        });
        return;
      }

      await authService.changePassword(req.user.userId, currentPassword, newPassword);

      res.json({
        success: true,
        data: { message: 'Password changed successfully' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_CHANGE_FAILED', message },
      });
    }
  }
);

export default router;
