import type { User } from "./user";

export interface LoginResponseData {
  token: string;
  user: User;
}