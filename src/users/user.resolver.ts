import { Resolver, Query } from '@nestjs/graphql';
import { UserType } from './user.type';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';

@Resolver((of) => UserType)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => [UserType])
  @Throttle(50, 60)
  users() {
    return this.userService.getUsers();
  }
}
