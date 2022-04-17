import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Profession')
export class ProfessionType {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;
}
