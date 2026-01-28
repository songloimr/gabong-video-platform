import { Module } from '@nestjs/common';
import { VideoMarkupsService } from './video-markups.service';
import { VideoMarkupsController } from './video-markups.controller';
import { DrizzleModule } from '../../database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [VideoMarkupsController],
  providers: [VideoMarkupsService],
  exports: [VideoMarkupsService],
})
export class VideoMarkupsModule {}
