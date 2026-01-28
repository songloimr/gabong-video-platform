import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsBoolean,
    IsOptional,
    IsDateString,
    MaxLength,
} from 'class-validator';

export enum AnnouncementType {
    INFO = 'info',
    WARNING = 'warning',
    SUCCESS = 'success',
    ERROR = 'error',
}

export enum AnnouncementPosition {
    HEADER_BAR = 'header_bar',
    HOMEPAGE_BANNER = 'homepage_banner',
    VIDEO_SIDEBAR = 'video_sidebar',
}

export class CreateAnnouncementDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsOptional()
    @IsEnum(AnnouncementType)
    type?: AnnouncementType;

    @IsOptional()
    @IsEnum(AnnouncementPosition)
    position?: AnnouncementPosition;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;
}

export class UpdateAnnouncementDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsEnum(AnnouncementType)
    type?: AnnouncementType;

    @IsOptional()
    @IsEnum(AnnouncementPosition)
    position?: AnnouncementPosition;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;
}
