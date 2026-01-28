import { Module, Global } from '@nestjs/common';
import { MediaProcessingService } from './media-processing.service';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Global()
@Module({
    imports: [SiteSettingsModule],
    providers: [MediaProcessingService],
    exports: [MediaProcessingService],
})
export class MediaProcessingModule { }
