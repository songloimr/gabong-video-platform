import { registerAs } from '@nestjs/config';

export default registerAs('rateLimit', () => ({
  feedback: {
    dailyLimit: parseInt(process.env.RATE_LIMIT_FEEDBACK_DAILY_LIMIT || '2'),
  }
}));
