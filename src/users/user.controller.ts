import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserRole } from './user-role.enum';
import { Throttle } from '@nestjs/throttler';
import RolesGuard from './user-role.guard';
import { User } from './user.schema';
import MongooseClassSerializerInterceptor from '../mongooseClassSerializer.interceptor';

@Controller('user')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private UserService: UserService) {}

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  getUsers() {
    return this.UserService.getUsers();
  }
}
