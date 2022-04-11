import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  CacheInterceptor,
  Put,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MediaSocialService } from './media_social.service';
import { UserRole } from '../../users/user-role.enum';
import { Throttle } from '@nestjs/throttler';
import { MediaSocialDto } from './media_social.dto';
import { TransResponse } from './media_social.type';
import RolesGuard from '../../users/user-role.guard';

@Controller('mediasocial')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'))
export class MediaSocialController {
  constructor(private MediaSocialService: MediaSocialService) {}

  @Post()
  async registerMediaSocial(
    @Body() MediaSocialDto: MediaSocialDto,
  ): Promise<TransResponse> {
    return this.MediaSocialService.registerMediaSocial(MediaSocialDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async getMediaSocials() {
    return this.MediaSocialService.getMediaSocials();
  }

  @Patch(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async updateMediaSocial(
    @Param('id') id: string,
    @Body() MediaSocialDto: MediaSocialDto,
  ): Promise<TransResponse> {
    return this.MediaSocialService.updateMediaSocial(id, MediaSocialDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async deleteMediaSocial(@Param('id') id: string): Promise<TransResponse> {
    return this.MediaSocialService.deleteMediaSocial(id);
  }
}
