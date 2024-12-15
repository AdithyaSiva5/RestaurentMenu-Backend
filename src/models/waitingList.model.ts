// src/models/waitingList.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWaitingList extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phoneNumber: string;
  numberOfMembers: number;
  status: "waiting" | "notified" | "seated" | "cancelled";
  estimatedWaitTime: number; 
  queueNumber: number;
  createdAt: Date;
  notifiedAt?: Date;
  seatedAt?: Date;
}

const WaitingListSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  numberOfMembers: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ["waiting", "notified", "seated", "cancelled"],
    default: "waiting",
  },
  estimatedWaitTime: {
    type: Number,
    required: true,
  },
  queueNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notifiedAt: Date,
  seatedAt: Date,
});

export const WaitingList = mongoose.model<IWaitingList>(
  "WaitingList",
  WaitingListSchema
);
