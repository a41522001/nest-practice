interface RotateRefreshTokenDto {
  oldRefreshToken: string;
  newRefreshToken: string;
  userId: string;
  sub: string;
  username: string;
  newExpireDate: Date;
  email: string;
}
interface SaveRefreshTokenDto {
  userId: string;
  sub: string;
  username: string;
  refreshToken: string;
  expireDate: Date;
  email: string;
}
export type { RotateRefreshTokenDto, SaveRefreshTokenDto };
