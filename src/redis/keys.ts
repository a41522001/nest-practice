const authRefreshTokenKey = (refreshToken: string): string =>
  `auth:refreshToken#${refreshToken}`;

const authUserRefreshTokenKey = (userId: string): string =>
  `auth:user#${userId}:refreshToken`;

export { authRefreshTokenKey, authUserRefreshTokenKey };
