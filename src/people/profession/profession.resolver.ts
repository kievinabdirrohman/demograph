import { Resolver, Query } from '@nestjs/graphql';
import { ProfessionType } from './profession.type';
import { ProfessionService } from './profession.service';
import { Throttle } from '@nestjs/throttler';

@Resolver((of) => ProfessionType)
export class ProfessionResolver {
  constructor(private professionService: ProfessionService) {}

  @Query((returns) => [ProfessionType])
  @Throttle(50, 60)
  async profession() {
    return this.professionService.getProfessionGraph();
  }
}
