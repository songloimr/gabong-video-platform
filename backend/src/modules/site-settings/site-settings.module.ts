import { Module } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import {
    SiteSettingsController,
    AdminSettingsController,
} from './site-settings.controller';
import { DrizzleModule } from '../../database/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [SiteSettingsController, AdminSettingsController],
    providers: [SiteSettingsService],
    exports: [SiteSettingsService],
})
export class SiteSettingsModule { }
