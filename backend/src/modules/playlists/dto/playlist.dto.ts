import { IsString, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;
}

export class UpdatePlaylistDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;
}

export class AddVideosDto {
  @IsArray()
  @IsString({ each: true })
  video_ids: string[];
}
