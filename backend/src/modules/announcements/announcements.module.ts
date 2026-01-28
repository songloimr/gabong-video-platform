import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import {
    AnnouncementsController,
    AdminAnnouncementsController,
} from './announcements.controller';
import { DrizzleModule } from '../../database/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [AnnouncementsController, AdminAnnouncementsController],
    providers: [AnnouncementsService],
    exports: [AnnouncementsService],
})
export class AnnouncementsModule { }
