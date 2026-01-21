interface HashAuthRefreshToken {
  userId: string;
  expire: number;
  sub: string;
  name: string;
  isOld: boolean;
  email: string;
}
interface HashUserInfo {
  id: string;
  name: string;
  email: string;
}
export type { HashAuthRefreshToken, HashUserInfo };
