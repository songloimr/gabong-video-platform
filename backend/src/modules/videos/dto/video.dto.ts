import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { videoSourceTypeEnum, videoStatusEnum } from '../../../database/schema';
import {
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  SEARCH_MAX_LENGTH,
} from '../../../common/constants';
import { IsSecure } from '../../../common/validators';
import { VideoStatus } from '../../../types';
import { VideoSourceType } from '../../../types/video.types';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(TITLE_MIN_LENGTH, {
    message: `Title must be at least ${TITLE_MIN_LENGTH} characters`,
  })
  @MaxLength(TITLE_MAX_LENGTH, {
    message: `Title must be at most ${TITLE_MAX_LENGTH} characters`,
  })
  @IsSecure()
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(DESCRIPTION_MAX_LENGTH, {
    message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
  })
  description?: string;

  @IsEnum(VideoSourceType)
  source_type: VideoSourceType;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  @IsSecure()
  embed_url?: string;

  @IsOptional()
  @IsString()
  @IsSecure()
  thumbnail_url?: string;

  local_path?: string;
  duration?: number;
  resolution?: string;
  file_size?: number;
}

export class UpdateVideoDto {
  @IsString()
  @IsOptional()
  @MinLength(TITLE_MIN_LENGTH, {
    message: `Title must be at least ${TITLE_MIN_LENGTH} characters`,
  })
  @MaxLength(TITLE_MAX_LENGTH, {
    message: `Title must be at most ${TITLE_MAX_LENGTH} characters`,
  })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(DESCRIPTION_MAX_LENGTH, {
    message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
  })
  description?: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsOptional()
  @IsString()
  status?: VideoStatus;

  video_url?: string;
  thumbnail_url?: string;
  video_key?: string;
  thumbnail_key?: string;
  updated_at?: Date;
  published_at?: Date;
}

export class VideoListParams {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @IsSecure()
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @IsSecure()
  tag?: string;

  @IsString()
  @IsOptional()
  sort?: 'newest' | 'views' | 'likes';

  @IsString()
  @IsOptional()
  @MaxLength(SEARCH_MAX_LENGTH, {
    message: `Search query must be at most ${SEARCH_MAX_LENGTH} characters`,
  })
  @IsSecure()
  search?: string;
}

export class UpdateVisibilityDto {
  @IsEnum(videoStatusEnum)
  status: VideoStatus;
}

export class UpdateUploadDateDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  custom_upload_date: string;
}

export class RejectVideoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @IsSecure()
  reason: string;
}
