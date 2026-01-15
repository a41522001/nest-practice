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
  user: JwtPayload & { id: string };
}
interface Todo {
  title: string;
  id: number;
}
export type { RequestWithUser, JwtPayload, Todo };
