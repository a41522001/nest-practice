interface HashAuthRefreshToken {
  userId: string;
  expire: number;
  sub: string;
  name: string;
  isOld: boolean;
}
interface HashUserInfo {
  id: string;
  name: string;
  email: string;
}
export type { HashAuthRefreshToken, HashUserInfo };
