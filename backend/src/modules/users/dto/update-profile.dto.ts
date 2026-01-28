import { IsString, IsOptional, IsEmail, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  bio?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  remove_avatar?: string;
}

export class UserFilterDto {
  @IsString()
  @IsOptional()
  status?: 'active' | 'suspended' | 'banned';

  @IsString()
  @IsOptional()
  search?: string;
}
