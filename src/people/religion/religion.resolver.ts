import { Resolver, Query } from '@nestjs/graphql';
import { ReligionType } from './religion.type';
import { ReligionService } from './religion.service';
import { Throttle } from '@nestjs/throttler';

@Resolver((of) => ReligionType)
export class ReligionResolver {
  constructor(private religionService: ReligionService) {}

  @Query((returns) => [ReligionType])
  @Throttle(50, 60)
  async religion() {
    return this.religionService.getReligionGraph();
  }
}
