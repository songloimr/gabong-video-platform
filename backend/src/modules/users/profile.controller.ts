import { Controller, Get, Put, Body, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto';
import { Roles, User } from '../../common/decorators';
import { JwtPayload } from '../../types';
import { Role } from '../../constants/role.enum';

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles(Role.User, Role.Admin)
  async getProfile(@User() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Put()
  @Roles(Role.User, Role.Admin)
  async updateProfile(
    @User() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Put('avatar')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @User() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3 * 1024 * 1024, errorMessage: 'File size must be less than 3MB' }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/, errorMessage: 'File type must be jpg, jpeg, png, gif, or webp' }),
        ],
        fileIsRequired: true
      }),
    ) avatarFile: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(user.sub, avatarFile);
  }
}
