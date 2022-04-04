import {
  Controller,
  Get,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserRole } from './user-role.enum';
import { Throttle } from '@nestjs/throttler';
import RolesGuard from './user-role.guard';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
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
