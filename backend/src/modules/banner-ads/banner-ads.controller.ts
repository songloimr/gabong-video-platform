import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { BannerAdsService } from './banner-ads.service';
import { Roles } from '../../common/decorators';
import { CreateBannerAdDto, UpdateBannerAdDto } from './dto';
import { Role } from '../../constants/role.enum';
import { HttpCacheInterceptor } from '../../common/interceptors';

@Controller('banner-ads')
export class BannerAdsController {
  constructor(private readonly bannerAdsService: BannerAdsService) { }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async getActiveAds() {
    return this.bannerAdsService.getActiveAds();
  }

  @Get('position/:position')
  async getAdsByPosition(@Param('position') position: string) {
    return this.bannerAdsService.getAdsByPosition(position);
  }

  @Post('track-click/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackClick(@Param('id') id: string) {
    await this.bannerAdsService.trackClick(id);
  }

  @Post('track-impression/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackImpression(@Param('id') id: string) {
    await this.bannerAdsService.trackImpression(id);
  }

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBannerAdDto) {
    return this.bannerAdsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateBannerAdDto) {
    return this.bannerAdsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.bannerAdsService.delete(id);
  }
}
