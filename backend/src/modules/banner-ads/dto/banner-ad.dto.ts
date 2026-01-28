import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateBannerAdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUrl()
  @IsOptional()
  link_url?: string;

  @IsString()
  @IsNotEmpty()
  position: string;
}

export class UpdateBannerAdDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  link_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
