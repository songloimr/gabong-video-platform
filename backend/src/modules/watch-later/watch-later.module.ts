import { Module } from '@nestjs/common';
import { WatchLaterService } from './watch-later.service';
import { WatchLaterController } from './watch-later.controller';
import { DrizzleModule } from '../../database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [WatchLaterController],
  providers: [WatchLaterService],
  exports: [WatchLaterService],
})
export class WatchLaterModule {}
