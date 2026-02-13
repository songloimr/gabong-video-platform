import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import {
    AnnouncementsController,
    AdminAnnouncementsController,
} from './announcements.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
    imports: [DrizzleModule, SiteSettingsModule],
    controllers: [AnnouncementsController, AdminAnnouncementsController],
    providers: [AnnouncementsService],
    exports: [AnnouncementsService],
})
export class AnnouncementsModule { }
