import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import {
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../common/constants';
import { IsSecure } from '../../../common/validators';

export class LoginDto {
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  @IsSecure()
  username: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @IsOptional()
  remember_me?: boolean;
}
