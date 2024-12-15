// src/models/user.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  phoneNumber: string;
  name: string;
  numberOfMembers: number;
  isVerified: boolean;
  role: "customer" | "waiter" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  numberOfMembers: {
    type: Number,
    required: true,
    min: 1,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["customer", "waiter", "admin"],
    default: "customer",
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema);
