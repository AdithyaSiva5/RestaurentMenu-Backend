import { Request, Response, NextFunction } from "express-serve-static-core";
import Joi from "joi";
const phoneAuthSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be in E.164 format (e.g., +14155552671)",
      "any.required": "Phone number is required",
    }),
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "any.required": "Name is required",
  }),
  numberOfMembers: Joi.number().min(1).max(20).required().messages({
    "number.min": "Number of members must be at least 1",
    "number.max": "Maximum 20 members allowed",
    "any.required": "Number of members is required",
  }),
  recaptchaToken: Joi.string().optional(), 
});

const otpVerificationSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required(),
  otpCode: Joi.string()
    .length(4)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "OTP must be 4 digits",
      "string.pattern.base": "OTP must contain only numbers",
    }),
  verificationId: Joi.string().required(),
});

export const validatePhoneAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = phoneAuthSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details.map((detail) => detail.message),
    });
    return;
  }
  next();
};

export const validateOTPVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { error } = otpVerificationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.details.map((detail) => detail.message),
      });
      return;
    }
    next();
  } catch (error: any) {
    next(error);
  }
};
const waitingListSchema = Joi.object({
  numberOfMembers: Joi.number().required().min(1).max(20).messages({
    "number.min": "Number of members must be at least 1",
    "number.max": "Maximum 20 members allowed",
    "any.required": "Number of members is required",
  }),
});

export const validateWaitingList = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = waitingListSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details.map((detail) => detail.message),
    });
    return;
  }
  next();
};
