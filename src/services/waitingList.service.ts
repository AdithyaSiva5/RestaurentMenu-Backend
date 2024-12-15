// src/services/waitingList.service.ts
import { WaitingList, IWaitingList } from "../models/waitingList.model";
import { User } from "../models/user.model";

export class WaitingListService {
  private static instance: WaitingListService;
  private readonly AVERAGE_WAITING_TIME = 15; // minutes per group

  private constructor() {}

  static getInstance(): WaitingListService {
    if (!WaitingListService.instance) {
      WaitingListService.instance = new WaitingListService();
    }
    return WaitingListService.instance;
  }

  async addToWaitingList(userId: string, data: any) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Check if already in waiting list
      const existingEntry = await WaitingList.findOne({
        userId,
        status: { $in: ["waiting", "notified"] },
      });

      if (existingEntry) {
        return {
          success: false,
          message: "Already in waiting list",
        };
      }

      // Calculate queue number and estimated wait time
      const waitingCount = await WaitingList.countDocuments({
        status: { $in: ["waiting", "notified"] },
      });
      const queueNumber = waitingCount + 1;
      const estimatedWaitTime = waitingCount * this.AVERAGE_WAITING_TIME;

      const waitingEntry = await WaitingList.create({
        userId,
        name: user.name,
        phoneNumber: user.phoneNumber,
        numberOfMembers: data.numberOfMembers,
        queueNumber,
        estimatedWaitTime,
      });

      return {
        success: true,
        message: "Added to waiting list",
        data: {
          queueNumber,
          estimatedWaitTime,
          position: waitingCount + 1,
        },
      };
    } catch (error) {
      console.error("Add to waiting list error:", error);
      throw error;
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

      return {
        success: true,
        data: {
          status: entry.status,
          queueNumber: entry.queueNumber,
          estimatedWaitTime: position * this.AVERAGE_WAITING_TIME,
          position,
        },
      };
    } catch (error) {
      console.error("Get waiting status error:", error);
      throw error;
    }
  }

  private async calculatePosition(queueNumber: number): Promise<number> {
    const waitingEntries = await WaitingList.find({
      status: { $in: ["waiting", "notified"] },
      queueNumber: { $lte: queueNumber },
    });
    return waitingEntries.length;
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
      console.error("Get waiting list error:", error);
      throw error;
    }
  }

  async notifyCustomer(id: string) {
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
      await entry.save();

      return {
        success: true,
        message: "Customer notified",
        data: entry,
      };
    } catch (error) {
      console.error("Notify customer error:", error);
      throw error;
    }
  }

  async seatCustomer(id: string) {
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
      await entry.save();

      return {
        success: true,
        message: "Customer seated",
        data: entry,
      };
    } catch (error) {
      console.error("Seat customer error:", error);
      throw error;
    }
  }
}
