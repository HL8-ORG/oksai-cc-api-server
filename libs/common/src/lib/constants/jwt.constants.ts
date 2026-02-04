import { env } from 'process';

export const JWT_SECRET = env.JWT_SECRET || 'default-secret-key-change-in-production';
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '1d';
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-key-change-in-production';
export const REFRESH_TOKEN_EXPIRES_IN = env.REFRESH_TOKEN_EXPIRES_IN || '7d';
