import { Router } from 'express';
import { createWorkflow, getWorkflows, getWorkflowById, updateWorkflow, deleteWorkflow } from '../controllers/workflow.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflowById);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

export default router;
