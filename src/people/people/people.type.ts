import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Media_SocialType } from '../media_social/media_social.type';
import { ProfessionType } from '../profession/profession.type';
import { ReligionType } from '../religion/religion.type';

@ObjectType('People')
export class PeopleType {
  @Field((type) => ID)
  id: string;

  @Field()
  pid: string;

  @Field()
  fullname: string;

  @Field()
  gender: string;

  @Field()
  place_of_birth: string;

  @Field()
  date_of_birth: string;

  @Field()
  address: string;

  @Field()
  is_married: string;

  @Field()
  is_alive: string;

  @Field()
  has_driver_license: string;

  @Field()
  has_insurance: string;

  @Field()
  has_passport: string;

  @Field((type) => [Media_SocialType])
  media_social: string[];

  @Field((type) => [ProfessionType])
  profession: string[];

  @Field((type) => [ReligionType])
  religion: string[];
}
