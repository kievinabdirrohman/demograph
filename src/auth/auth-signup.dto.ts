import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsAlphanumeric,
  IsEnum,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
} from 'class-validator';
import { UserRole } from '../users/user-role.enum';

export class SignUpDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEmpty()
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}.*$/,
    {
      message:
        'passwowrd must be contains at least minimum 8 characters length, maximum 32 characters length, one uppercase character, one lowercase character, one number, and one special character',
    },
  )
  password: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}.*$/,
    {
      message:
        'passwowrd must be contains at least minimum 8 characters length, maximum 32 characters length, one uppercase character, one lowercase character, one number, and one special character',
    },
  )
  password_confirmation: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsMobilePhone()
  @IsNotEmpty()
  phone_number: string;
}
