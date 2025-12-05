import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import narrativeRoutes from './routes/narrative.routes.js';
import brandVoiceRoutes from './routes/brandVoice.routes.js';
import visualRoutes from './routes/visual.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// More strict rate limiting for AI generation endpoints
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Generation rate limit exceeded. Please wait before generating more content.',
    },
  },
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/narratives', generationLimiter, narrativeRoutes);
app.use('/api/brand-voices', brandVoiceRoutes);
app.use('/api/visuals', generationLimiter, visualRoutes);

// API documentation endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'NarrativePulse API',
      version: '1.0.0',
      description: 'AI-Powered Strategic Storytelling Platform',
      endpoints: {
        auth: {
          'POST /api/auth/register': 'Register a new user',
          'POST /api/auth/login': 'Login user',
          'POST /api/auth/refresh': 'Refresh access token',
          'POST /api/auth/logout': 'Logout user',
          'GET /api/auth/me': 'Get current user',
          'PATCH /api/auth/profile': 'Update user profile',
          'POST /api/auth/change-password': 'Change password',
        },
        narratives: {
          'POST /api/narratives/generate': 'Generate a new narrative',
          'POST /api/narratives/demo': 'Demo generation (no auth)',
          'GET /api/narratives': 'Get user narratives',
          'GET /api/narratives/stats': 'Get user statistics',
          'GET /api/narratives/:id': 'Get specific narrative',
          'PATCH /api/narratives/:id': 'Update narrative',
          'DELETE /api/narratives/:id': 'Delete narrative',
        },
        brandVoices: {
          'GET /api/brand-voices/templates': 'Get brand voice templates',
          'POST /api/brand-voices': 'Create brand voice',
          'POST /api/brand-voices/analyze': 'Analyze examples to create brand voice',
          'POST /api/brand-voices/from-template': 'Create from template',
          'GET /api/brand-voices': 'Get user brand voices',
          'GET /api/brand-voices/default': 'Get default brand voice',
          'GET /api/brand-voices/:id': 'Get specific brand voice',
          'PATCH /api/brand-voices/:id': 'Update brand voice',
          'DELETE /api/brand-voices/:id': 'Delete brand voice',
        },
        visuals: {
          'GET /api/visuals/types': 'Get visual types',
          'GET /api/visuals/platforms': 'Get supported platforms',
          'POST /api/visuals/generate': 'Generate visual from narrative',
          'POST /api/visuals/regenerate/:narrativeId': 'Regenerate visual',
        },
      },
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
    },
  });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 NarrativePulse API Server                           ║
  ║                                                           ║
  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║
  ║   Port:        ${PORT.toString().padEnd(38)}║
  ║   Frontend:    ${(process.env.FRONTEND_URL || 'http://localhost:8080').padEnd(38)}║
  ║                                                           ║
  ║   API Docs:    http://localhost:${PORT}/api               ║
  ║   Health:      http://localhost:${PORT}/health            ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
