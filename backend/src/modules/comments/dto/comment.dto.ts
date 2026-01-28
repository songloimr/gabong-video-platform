import { IsString, IsOptional, IsUUID, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;
}

export class HideCommentDto {
  @IsBoolean()
  is_hidden: boolean;
}
