import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('User')
export class UserType {
  @Field((type) => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field()
  fullname: string;

  @Field()
  phone_number: string;
}
