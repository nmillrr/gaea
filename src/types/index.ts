import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequestBody {
  // Accepts either the account's email or its username (field name kept
  // as "email" for wire compatibility with existing clients).
  email: string;
  password: string;
}

export interface UpdateUserProfileBody {
  username?: string;
  avatarUrl?: string;
}