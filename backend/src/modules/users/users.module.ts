import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfileController } from './profile.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [DrizzleModule, StorageModule],
  controllers: [UsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
