import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  CacheInterceptor,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MediaSocialService } from './media_social.service';
import { UserRole } from '../../users/user-role.enum';
import { Throttle } from '@nestjs/throttler';
import { MediaSocialDto } from './media_social.dto';
import { DefaultResponse } from '../response.type';
import RolesGuard from '../../users/user-role.guard';
import { MediaSocial } from './media_social.schema';
import MongooseClassSerializerInterceptor from '../../mongooseClassSerializer.interceptor';

@Controller('mediasocial')
@UseInterceptors(MongooseClassSerializerInterceptor(MediaSocial))
@UseGuards(AuthGuard('jwt'))
export class MediaSocialController {
  constructor(private MediaSocialService: MediaSocialService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async registerMediaSocial(
    @Body() MediaSocialDto: MediaSocialDto,
  ): Promise<DefaultResponse> {
    return this.MediaSocialService.registerMediaSocial(MediaSocialDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async getMediaSocials(): Promise<DefaultResponse> {
    return this.MediaSocialService.getMediaSocials();
  }

  @Patch(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async updateMediaSocial(
    @Param('id') id: string,
    @Body() MediaSocialDto: MediaSocialDto,
  ): Promise<DefaultResponse> {
    return this.MediaSocialService.updateMediaSocial(id, MediaSocialDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async deleteMediaSocial(@Param('id') id: string): Promise<DefaultResponse> {
    return this.MediaSocialService.deleteMediaSocial(id);
  }
}
