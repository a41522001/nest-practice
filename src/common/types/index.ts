import { Request } from 'express';
interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
interface CustomRequest extends Request {
  user: {
    sub: string;
    username: string;
    id: string;
  };
  timezone: string;
}
interface Response<T> {
  code: number;
  data: T;
  message: string;
  time: string;
}
interface ErrorResponse {
  code: number;
  data: null;
  message: string;
  time: string;
  errors?: Record<string, string[]>;
}
interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export type { CustomRequest, JwtPayload, Tokens, Response, ErrorResponse };
