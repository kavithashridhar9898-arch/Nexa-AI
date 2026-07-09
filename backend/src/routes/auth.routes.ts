import { Router } from 'express';
import { register, verifyOtp, login, requestOtp, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/reset-password', resetPassword);

export default router;
