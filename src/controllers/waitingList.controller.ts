// src/controllers/waitingList.controller.ts
import { Request, Response } from "express";
import { WaitingListService } from "../services/waitingList.service";

export class WaitingListController {
  private waitingListService: WaitingListService;

  constructor() {
    this.waitingListService = WaitingListService.getInstance();
  }

  joinWaitingList = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const result = await this.waitingListService.addToWaitingList(
        userId.toString(),
        {
          ...req.body,
          name: req.user.name,
          phoneNumber: req.user.phoneNumber
        }
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to join waiting list",
        error: error.message,
      });
    }
  };

  checkWaitingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id.toString();
      const result = await this.waitingListService.getWaitingStatus(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to get waiting status",
        error: error.message,
      });
    }
  };

  getWaitingList = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.waitingListService.getAllWaiting();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to get waiting list",
        error: error.message,
      });
    }
  };

  notifyCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.waitingListService.notifyCustomer(id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to notify customer",
        error: error.message,
      });
    }
  };

  seatCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.waitingListService.seatCustomer(id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to seat customer",
        error: error.message,
      });
    }
  };
}