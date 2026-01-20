interface HashAuthRefreshToken {
  userId: string;
  expire: number;
  sub: string;
  name: string;
  isOld: boolean;
}
export type { HashAuthRefreshToken };
