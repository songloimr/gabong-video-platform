import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VideoProcessingProcessor } from './video-processing.processor';
import { VideosModule } from '../videos/videos.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'video-processing'
        }),
        forwardRef(() => VideosModule),
    ],
    providers: [VideoProcessingProcessor],
    exports: [BullModule, VideoProcessingProcessor],
})
export class VideoProcessingModule { }
