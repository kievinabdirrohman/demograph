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
import { ProfessionService } from './profession.service';
import { UserRole } from '../../users/user-role.enum';
import { Throttle } from '@nestjs/throttler';
import { ProfessionDto } from './profession.dto';
import { DefaultResponse } from '../response.type';
import RolesGuard from '../../users/user-role.guard';
import { Profession } from './profession.schema';
import MongooseClassSerializerInterceptor from '../../mongooseClassSerializer.interceptor';

@Controller('profession')
@UseInterceptors(MongooseClassSerializerInterceptor(Profession))
@UseGuards(AuthGuard('jwt'))
export class ProfessionController {
  constructor(private ProfessionService: ProfessionService) {}

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async registerProfession(
    @Body() ProfessionDto: ProfessionDto,
  ): Promise<DefaultResponse> {
    return this.ProfessionService.registerProfession(ProfessionDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async getProfessions(): Promise<DefaultResponse> {
    return this.ProfessionService.getProfessions();
  }

  @Patch(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async updateProfession(
    @Param('id') id: string,
    @Body() ProfessionDto: ProfessionDto,
  ): Promise<DefaultResponse> {
    return this.ProfessionService.updateProfession(id, ProfessionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async deleteProfession(@Param('id') id: string): Promise<DefaultResponse> {
    return this.ProfessionService.deleteProfession(id);
  }
}
