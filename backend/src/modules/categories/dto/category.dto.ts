import { IsString, IsOptional, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @Min(0)
  @IsOptional()
  sort_order?: number;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Min(0)
  @IsOptional()
  sort_order?: number;
}
