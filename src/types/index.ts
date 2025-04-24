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
  email: string;
  password: string;
}