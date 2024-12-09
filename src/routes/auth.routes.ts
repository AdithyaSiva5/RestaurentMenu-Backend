import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { phoneAuthLimiter } from '../middlewares/rateLimiter';
import { validatePhoneAuth, validateOTPVerification } from '../middlewares/validation';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();
const authController = new AuthController();

router.post(
  '/phone/initiate',
  phoneAuthLimiter,
  validatePhoneAuth,
  (req, res, next) => asyncHandler(authController.initiatePhoneAuth)(req, res, next)
);

router.post(
  '/phone/verify',
  validateOTPVerification,
  (req, res, next) => asyncHandler(authController.verifyOTP)(req, res, next)
);

export default router;