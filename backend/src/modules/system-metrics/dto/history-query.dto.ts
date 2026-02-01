import { IsOptional, IsString, IsIn } from 'class-validator';

export class HistoryQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['1h', '6h', '24h', '7d', '14d'])
  range?: string = '1h';

  @IsOptional()
  @IsString()
  @IsIn(['cpu', 'memory', 'storage', 'process', 'all'])
  type?: string = 'all';
}
