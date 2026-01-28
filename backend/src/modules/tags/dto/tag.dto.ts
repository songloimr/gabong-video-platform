import { IsString, IsOptional, Min } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;
}

export class TagSearchParams {
  @IsString()
  @IsOptional()
  search?: string;

  @Min(1)
  @IsOptional()
  limit?: number;
}
