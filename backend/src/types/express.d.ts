import { AuthJwtPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
    }
  }
}
