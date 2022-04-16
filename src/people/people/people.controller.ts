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
import { PeopleService } from './people.service';
import { UserRole } from '../../users/user-role.enum';
import { Throttle } from '@nestjs/throttler';
import { PeopleDto } from './people.dto';
import { DefaultResponse } from '../response.type';
import RolesGuard from '../../users/user-role.guard';
import { People } from './people.schema';
import MongooseClassSerializerInterceptor from '../../mongooseClassSerializer.interceptor';

@Controller('people')
@UseInterceptors(MongooseClassSerializerInterceptor(People))
@UseGuards(AuthGuard('jwt'))
export class PeopleController {
  constructor(private peopleService: PeopleService) {}

  @UseInterceptors(CacheInterceptor)
  @Get()
  @Throttle(50, 60)
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async getPeoples(): Promise<DefaultResponse> {
    return this.peopleService.getPeoples();
  }

  @Post()
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async registerPeople(@Body() peopleDto: PeopleDto): Promise<DefaultResponse> {
    return this.peopleService.registerPeople(peopleDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async updatePeople(
    @Param('id') id: string,
    @Body() peopleDto: PeopleDto,
  ): Promise<DefaultResponse> {
    return this.peopleService.updatePeople(id, peopleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(UserRole.ADMIN))
  async deletePeople(@Param('id') id: string): Promise<DefaultResponse> {
    return this.peopleService.deletePeople(id);
  }
}
