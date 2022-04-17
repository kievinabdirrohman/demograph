import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Religion')
export class ReligionType {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;
}
