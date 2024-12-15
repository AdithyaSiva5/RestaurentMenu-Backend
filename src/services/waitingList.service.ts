// src/services/waitingList.service.ts
import { WaitingList, IWaitingList } from "../models/waitingList.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";

export class WaitingListService {
  private static instance: WaitingListService;
  private readonly AVERAGE_WAITING_TIME = 15; // minutes per group
  private readonly MAX_QUEUE_SIZE = 50; // Maximum number of groups in queue

  private constructor() {}

  static getInstance(): WaitingListService {
    if (!WaitingListService.instance) {
      WaitingListService.instance = new WaitingListService();
    }
    return WaitingListService.instance;
  }

  async addToWaitingList(userId: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if already in waiting list
      const existingEntry = await WaitingList.findOne({
        userId,
        status: { $in: ["waiting", "notified"] },
      });

      if (existingEntry) {
        return {
          success: false,
          message: "Already in waiting list",
          data: {
            queueNumber: existingEntry.queueNumber,
            position: await this.calculatePosition(existingEntry.queueNumber),
          },
        };
      }

      // Check queue size
      const currentQueueSize = await WaitingList.countDocuments({
        status: { $in: ["waiting", "notified"] },
      });

      if (currentQueueSize >= this.MAX_QUEUE_SIZE) {
        return {
          success: false,
          message: "Queue is currently full. Please try again later.",
        };
      }

      // Calculate queue position and wait time
      const queueNumber = await this.generateQueueNumber();
      const estimatedWaitTime = this.calculateEstimatedWaitTime(
        currentQueueSize + 1
      );

      const waitingEntry = await WaitingList.create(
        [
          {
            userId,
            name: data.name,
            phoneNumber: data.phoneNumber,
            numberOfMembers: data.numberOfMembers,
            queueNumber,
            estimatedWaitTime,
            status: "waiting",
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        success: true,
        message: "Added to waiting list",
        data: {
          queueNumber,
          estimatedWaitTime,
          position: currentQueueSize + 1,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllWaiting() {
    try {
      const waitingList = await WaitingList.find({
        status: { $in: ["waiting", "notified"] },
      }).sort({ createdAt: 1 });

      return {
        success: true,
        data: waitingList,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get waiting list",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getWaitingStatus(userId: string) {
    try {
      const entry = await WaitingList.findOne({
        userId,
        status: { $in: ["waiting", "notified"] },
      });

      if (!entry) {
        return {
          success: false,
          message: "Not in waiting list",
        };
      }
      const position = await this.calculatePosition(entry.queueNumber);
      const estimatedWaitTime = this.calculateEstimatedWaitTime(position);

      // Update estimated wait time if it has changed
      if (estimatedWaitTime !== entry.estimatedWaitTime) {
        entry.estimatedWaitTime = estimatedWaitTime;
        await entry.save();
      }

      return {
        success: true,
        data: {
          status: entry.status,
          queueNumber: entry.queueNumber,
          estimatedWaitTime,
          position,
          numberOfMembers: entry.numberOfMembers,
          notifiedAt: entry.notifiedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to get waiting status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async notifyCustomer(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const entry = await WaitingList.findById(id);
      if (!entry) {
        return {
          success: false,
          message: "Entry not found",
        };
      }

      entry.status = "notified";
      entry.notifiedAt = new Date();
      await entry.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message: "Customer notified",
        data: entry,
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        message: "Failed to notify customer",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      session.endSession();
    }
  }

  async seatCustomer(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const entry = await WaitingList.findById(id);
      if (!entry) {
        return {
          success: false,
          message: "Entry not found",
        };
      }

      entry.status = "seated";
      entry.seatedAt = new Date();
      await entry.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message: "Customer seated",
        data: entry,
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        message: "Failed to seat customer",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      session.endSession();
    }
  }

  private async generateQueueNumber(): Promise<number> {
    const lastEntry = await WaitingList.findOne().sort({ queueNumber: -1 });
    return (lastEntry?.queueNumber || 0) + 1;
  }

  private calculateEstimatedWaitTime(position: number): number {
    return position * this.AVERAGE_WAITING_TIME;
  }

  private async calculatePosition(queueNumber: number): Promise<number> {
    const waitingEntries = await WaitingList.find({
      status: { $in: ["waiting", "notified"] },
      queueNumber: { $lte: queueNumber },
    }).sort({ queueNumber: 1 });

    // Get actual position considering only active entries
    return waitingEntries.length;
  }
}
