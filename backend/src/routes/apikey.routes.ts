import { Router } from 'express';
import { createApiKey, getApiKeys, revokeApiKey } from '../controllers/apikey.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createApiKey);
router.get('/', getApiKeys);
router.delete('/:id', revokeApiKey);

export default router;
