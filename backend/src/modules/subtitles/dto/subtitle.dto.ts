import { IsString, IsOptional, IsInt, Min, IsUUID, MaxLength } from 'class-validator';

export class CreateSubtitleDto {
  @IsUUID()
  video_id: string;

  @IsString()
  @MaxLength(100)
  label: string;

  @IsString()
  @MaxLength(10)
  language_code: string;

  @IsString()
  vtt_content: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;
}

export class UpdateSubtitleDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  label?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  language_code?: string;

  @IsString()
  @IsOptional()
  vtt_content?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;
}
