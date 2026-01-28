import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, TagSearchParams } from './dto';
import { Roles } from '../../common/decorators';
import { Role } from '../../constants/role.enum';
import { HttpCacheInterceptor } from '../../common/interceptors';


@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async findAll(
    @Query() params: TagSearchParams,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.tagsService.findAll({ ...params, limit });
  }

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }
}
