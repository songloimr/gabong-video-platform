import { registerAs } from '@nestjs/config';

export default registerAs('cloudflare', () => ({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: process.env.CLOUDFLARE_R2_BUCKET || 'gabong-videos',
}));
