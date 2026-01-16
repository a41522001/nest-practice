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

interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export type { RequestWithUser, JwtPayload, Tokens };
