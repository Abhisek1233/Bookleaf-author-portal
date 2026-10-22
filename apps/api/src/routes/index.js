import { Router } from 'express';
import authRoutes from './auth.routes.js';
import authorRoutes from './author.routes.js';
import adminRoutes from './admin.routes.js';
import { healthCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/author', authorRoutes);
router.use('/admin', adminRoutes);

export default router;
