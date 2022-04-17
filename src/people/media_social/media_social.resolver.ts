import { Resolver, Query } from '@nestjs/graphql';
import { Media_SocialType } from './media_social.type';
import { MediaSocialService } from './media_social.service';
import { Throttle } from '@nestjs/throttler';

@Resolver((of) => Media_SocialType)
export class MediaSocialResolver {
  constructor(private mediaSocialService: MediaSocialService) {}

  @Query((returns) => [Media_SocialType])
  @Throttle(50, 60)
  async media_social() {
    return this.mediaSocialService.getMediaSocialGraph();
  }
}
