import { Resolver, Query } from '@nestjs/graphql';
import { PeopleType } from './people.type';
import { PeopleService } from './people.service';
import { Throttle } from '@nestjs/throttler';

@Resolver((of) => PeopleType)
export class PeopleResolver {
  constructor(private peopleService: PeopleService) {}

  @Query((returns) => [PeopleType])
  @Throttle(50, 60)
  async peoples() {
    return this.peopleService.getPeopleGraph();
  }
}
