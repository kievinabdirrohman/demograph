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
import { ReligionService } from './religion.service';
import { UserRole } from '../../users/user-role.enum';
import { Throttle } from '@nestjs/throttler';
import { ReligionDto } from './religion.dto';
import { TransResponse } from './response.type';
import RolesGuard from '../../users/user-role.guard';

@Controller('religion')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ReligionController {
  constructor(private ReligionService: ReligionService) {}

  @Post()
  async registerReligion(
    @Body() ReligionDto: ReligionDto,
  ): Promise<TransResponse> {
    return this.ReligionService.registerReligion(ReligionDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async getReligions() {
    return this.ReligionService.getReligions();
  }

  @Patch(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async updateReligion(
    @Param('id') id: string,
    @Body() ReligionDto: ReligionDto,
  ): Promise<TransResponse> {
    return this.ReligionService.updateReligion(id, ReligionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async deleteReligion(@Param('id') id: string): Promise<TransResponse> {
    return this.ReligionService.deleteReligion(id);
  }
}
