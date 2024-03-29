import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth-signin.dto';
import { SignUpDto } from './auth-signup.dto';
import { AuthResponse } from './response.type';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../users/user.schema';
import MongooseClassSerializerInterceptor from '../mongooseClassSerializer.interceptor';

@Controller('auth')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() SignUpDto: SignUpDto): Promise<AuthResponse> {
    return this.authService.signUp(SignUpDto);
  }

  @Post('/signin')
  @Throttle(60, 3600)
  async signIn(@Body() SignInDto: SignInDto): Promise<AuthResponse> {
    return this.authService.signIn(SignInDto);
  }

  @Get('/refresh_token')
  @Throttle(60, 3600)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshToken(@GetUser() user: User): Promise<AuthResponse> {
    return this.authService.refreshToken(user);
  }
}
