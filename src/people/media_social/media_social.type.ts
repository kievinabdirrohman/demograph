import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Media_Social')
export class Media_SocialType {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;
}
