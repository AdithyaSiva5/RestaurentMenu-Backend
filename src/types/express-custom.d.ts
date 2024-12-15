// src/types/express-custom.d.ts
import { DeviceInfo } from "./security.types";

declare global {
  namespace Express {
    interface Request {
      deviceInfo: DeviceInfo;
      user?: IUser;
    }
  }
}
