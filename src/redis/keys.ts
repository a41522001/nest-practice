const authRefreshTokenKey = (refreshToken: string): string =>
  `auth:refreshToken#${refreshToken}`;

const authUserRefreshTokenKey = (userId: string): string =>
  `auth:user#${userId}:refreshToken`;

const userSubKey = (sub: string): string => `user:sub#${sub}`;

export { authRefreshTokenKey, authUserRefreshTokenKey, userSubKey };
