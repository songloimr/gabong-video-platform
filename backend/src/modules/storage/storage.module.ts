import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Global()
@Module({
    imports: [SiteSettingsModule],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
