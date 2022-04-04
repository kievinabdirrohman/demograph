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
import { TransResponse } from './response.type';
import RolesGuard from '../../users/user-role.guard';

@Controller('profession')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'))
export class ProfessionController {
  constructor(private ProfessionService: ProfessionService) {}

  @Post()
  async registerProfession(@Body() ProfessionDto: ProfessionDto): Promise<TransResponse> {
    return this.ProfessionService.registerProfession(ProfessionDto);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async getProfessions() {
    return this.ProfessionService.getProfessions();
  }

  @Patch(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async updateProfession(
    @Param('id') id: string,
    @Body() ProfessionDto: ProfessionDto,
  ): Promise<TransResponse> {
    return this.ProfessionService.updateProfession(id, ProfessionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async deleteProfession(
    @Param('id') id: string,
  ): Promise<TransResponse> {
    return this.ProfessionService.deleteProfession(id);
  }
}
