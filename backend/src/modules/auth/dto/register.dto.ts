import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  USERNAME_PATTERN_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_PATTERN_MESSAGE,
} from '../../../common/constants';
import { IsSecure } from '../../../common/validators';

export class RegisterDto {
  @IsString()
  @MinLength(USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
  })
  @Matches(USERNAME_PATTERN, {
    message: USERNAME_PATTERN_MESSAGE,
  })
  @IsSecure()
  username: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  })
  @Matches(PASSWORD_PATTERN, {
    message: PASSWORD_PATTERN_MESSAGE,
  })
  password: string;

  @IsEmail()
  @IsOptional()
  @IsSecure()
  email?: string;
}
