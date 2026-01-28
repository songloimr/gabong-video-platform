import { IsString, IsOptional, IsInt, Min, IsUUID, MaxLength } from 'class-validator';

export class CreateVideoMarkupDto {
  @IsUUID()
  video_id: string;

  @IsInt()
  @Min(0)
  time: number;

  @IsString()
  text: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  width?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;
}

export class UpdateVideoMarkupDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  time?: number;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  width?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;
}
