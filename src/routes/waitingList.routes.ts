// src/routes/waitingList.routes.ts
import express, { Router } from "express";
import { WaitingListController } from "../controllers/waitingList.controller";
import { validateWaitingList } from "../middleware/validation";
import { protect, restrictTo } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router: Router = express.Router();
const waitingListController = new WaitingListController();

// Customer routes
router.post(
  "/join",
  protect,
  validateWaitingList,
  asyncHandler(waitingListController.joinWaitingList)
);

router.get(
  "/status/me",
  protect,
  asyncHandler(waitingListController.checkWaitingStatus)
);

// Waiter/Admin routes
router.get(
  "/list",
  protect,
  restrictTo('waiter', 'admin'),
  asyncHandler(waitingListController.getWaitingList)
);

router.put(
  "/notify/:id",
  protect,
  restrictTo('waiter', 'admin'),
  asyncHandler(waitingListController.notifyCustomer)
);

router.put(
  "/seat/:id",
  protect,
  restrictTo('waiter', 'admin'),
  asyncHandler(waitingListController.seatCustomer)
);

export default router;