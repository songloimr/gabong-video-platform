import { Controller, Get, Put, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSettingsDto } from './dto/site-settings.dto';
import { Roles } from '../../common/decorators';
import { Role } from '../../constants/role.enum';
import { HttpCacheInterceptor } from '../../common/interceptors';

@Controller('site-settings')
export class SiteSettingsController {
    constructor(private readonly siteSettingsService: SiteSettingsService) { }

    @Get('public')
    @UseInterceptors(HttpCacheInterceptor)
    async getPublicSettings() {
        return this.siteSettingsService.getAllPublicSettings();
    }
}

@Controller('admin/settings')
export class AdminSettingsController {
    constructor(private readonly siteSettingsService: SiteSettingsService) { }

    @Get()
    @Roles(Role.Admin)
    async getAllSettings() {
        return this.siteSettingsService.getAllAdminSettings();
    }

    @Put()
    @Roles(Role.Admin)
    async updateSettings(@Body() dto: UpdateSettingsDto) {
        await this.siteSettingsService.updateSettings(dto.settings);
        return { message: 'Settings updated successfully' };
    }
}
