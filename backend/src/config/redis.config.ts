import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
    host: 'redis-14776.crce178.ap-east-1-1.ec2.cloud.redislabs.com',
    port: 14776,
    username: 'default',
    password: 'kXuZHeSkMPO18unQ5VL25f3N419DD8qU',
}));
