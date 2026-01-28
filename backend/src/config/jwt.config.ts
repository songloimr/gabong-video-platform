import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  // In production, secrets must be configured via environment variables
  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error('JWT_SECRET must be configured in production');
    }
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET must be configured in production');
    }
  }

  return {
    secret: secret || 'dev-secret-only-for-development',
    refreshSecret: refreshSecret || 'dev-refresh-secret-only-for-development',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '30m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  };
});
