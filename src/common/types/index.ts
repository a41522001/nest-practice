import { Request } from 'express';
interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
interface RequestWithUser extends Request {
  user: {
    sub: string;
    username: string;
    id: string;
  };
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
export type { RequestWithUser, JwtPayload, Tokens, Response, ErrorResponse };
