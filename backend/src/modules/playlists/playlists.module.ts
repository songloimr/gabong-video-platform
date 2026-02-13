import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [DrizzleModule, SiteSettingsModule],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule { }
