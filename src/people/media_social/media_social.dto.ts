import { IsString, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class MediaSocialDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  name: string;
}
