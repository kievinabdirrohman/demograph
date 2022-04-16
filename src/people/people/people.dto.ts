import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsAlphanumeric,
  IsNumberString,
  IsEnum,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsDateString,
  IsUUID,
  IsBooleanString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PeopleGender } from './people-gender.enum';
import { MediaSocial } from '../media_social/media_social.schema';

export class PeopleDto {
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  @IsNumberString()
  @IsNotEmpty()
  pid: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsNotEmpty()
  fullname: string;

  @IsEnum(PeopleGender)
  @IsNotEmpty()
  gender: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsNotEmpty()
  place_of_birth: string;

  @IsDateString()
  @IsNotEmpty()
  date_of_birth: Date;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsNotEmpty()
  address: string;

  @IsBooleanString()
  @IsNotEmpty()
  is_married: boolean;

  @IsBooleanString()
  @IsNotEmpty()
  is_alive: boolean;

  @IsBooleanString()
  @IsNotEmpty()
  has_driver_license: boolean;

  @IsBooleanString()
  @IsNotEmpty()
  has_insurance: boolean;

  @IsBooleanString()
  @IsNotEmpty()
  has_passport: boolean;

  @IsString()
  @IsNotEmpty()
  religionId: string;

  @IsString()
  @IsNotEmpty()
  professionId: string;

  @IsArray()
  @IsNotEmpty()
  @Type(() => MediaSocial)
  mediaSocialId: MediaSocial[];
}
