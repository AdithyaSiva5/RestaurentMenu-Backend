import { Request, Response, NextFunction } from "express";
import { WaitingList } from "../models/waitingList.model";

export const checkExistingWaitingEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existingEntry = await WaitingList.findOne({
      userId: req.user._id,
      status: { $in: ["waiting", "notified"] },
    });

    if (existingEntry) {
      res.status(400).json({
        success: false,
        message: "Already in waiting list",
        data: {
          queueNumber: existingEntry.queueNumber,
          status: existingEntry.status,
        },
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
