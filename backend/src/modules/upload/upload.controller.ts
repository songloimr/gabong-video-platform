import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Roles, User } from '../../common/decorators';
import { JwtPayload } from '../../types';
import { CreateVideoDto } from '../videos/dto';
import { Role } from '../../constants/role.enum';
import { UploadRestrictionGuard } from '../../common/guards/upload-restriction.guard';

@Controller('videos/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @Roles(Role.User, Role.Admin)
  @UseGuards(UploadRestrictionGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]))
  async upload(
    @UploadedFiles() files: { file?: Express.Multer.File[], thumbnail?: Express.Multer.File[] },
    @Body() dto: CreateVideoDto,
    @User() user: JwtPayload,
  ) {
    const videoFile = files.file?.[0];
    const thumbnailFile = files.thumbnail?.[0];
    return this.uploadService.handleUpload(videoFile, thumbnailFile, dto, user.sub);
  }
}
