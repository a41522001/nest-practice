interface RotateRefreshToken {
  oldRefreshToken: string;
  newRefreshToken: string;
  userId: string;
  sub: string;
  username: string;
  newExpireDate: Date;
}
export type { RotateRefreshToken };
