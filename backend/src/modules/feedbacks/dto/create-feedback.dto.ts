import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';

export enum FeedbackType {
  BUG = 'bug',
  SUGGESTION = 'suggestion',
  OTHER = 'other',
}

export class CreateFeedbackDto {
  @IsEnum(FeedbackType)
  @IsNotEmpty()
  type: FeedbackType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
