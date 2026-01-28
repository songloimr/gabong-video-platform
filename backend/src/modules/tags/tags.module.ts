import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [DrizzleModule, SiteSettingsModule],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
