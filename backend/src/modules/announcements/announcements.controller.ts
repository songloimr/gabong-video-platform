import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import {
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { Roles, User, CacheTTL } from '../../common/decorators';
import { Role } from '../../constants/role.enum';
import { JwtPayload } from '../../types';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor';

@Controller('announcements')
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    @Get()
    @UseInterceptors(HttpCacheInterceptor)
    @CacheTTL(60) // 60 minutes
    async getActiveAnnouncements(@Query('position') position?: string) {
        return this.announcementsService.findActive(position);
    }
}

@Controller('admin/announcements')
@Roles(Role.Admin)
export class AdminAnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    @Get()
    async getAllAnnouncements(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    ) {
        return this.announcementsService.findAll({ page, limit });
    }

    @Get(':id')
    async getAnnouncement(@Param('id') id: string) {
        return this.announcementsService.findOne(id);
    }

    @Post()
    async createAnnouncement(
        @Body() dto: CreateAnnouncementDto,
        @User() user: JwtPayload,
    ) {
        return this.announcementsService.create(dto, user.sub);
    }

    @Put(':id')
    async updateAnnouncement(
        @Param('id') id: string,
        @Body() dto: UpdateAnnouncementDto,
    ) {
        return this.announcementsService.update(id, dto);
    }

    @Delete(':id')
    async deleteAnnouncement(@Param('id') id: string) {
        await this.announcementsService.remove(id);
        return { message: 'Announcement deleted successfully' };
    }
}
