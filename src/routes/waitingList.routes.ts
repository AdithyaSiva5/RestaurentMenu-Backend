// src/routes/waitingList.routes.ts
import express from "express";
import { WaitingListController } from "../controllers/waitingList.controller";
import { validateWaitingList } from "../middleware/validation";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";


const router = express.Router();
const waitingListController = new WaitingListController();

// Instead of router.use(), apply middlewares to specific routes
// Customer routes
router.post(
  "/join",
  [protect, validateWaitingList], // Apply as array of middleware
  asyncHandler(waitingListController.joinWaitingList)
);

router.get(
  "/status/:userId",
  protect, // Apply directly to route
  asyncHandler(waitingListController.checkWaitingStatus)
);

// Waiter routes
router.put(
  "/notify/:id",
  [protect, restrictTo("waiter", "admin")], // Apply both as array
  asyncHandler(waitingListController.notifyCustomer)
);

router.put(
  "/seat/:id",
  [protect, restrictTo("waiter", "admin")],
  asyncHandler(waitingListController.seatCustomer)
);

router.get(
  "/list",
  [protect, restrictTo("waiter", "admin")],
  asyncHandler(waitingListController.getWaitingList)
);

export default router;
