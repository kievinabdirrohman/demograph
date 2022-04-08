import { MediaSocialBody } from './media_social-body.interface';

export interface MediaSocialResponse {
  hits: {
    total: number;
    hits: Array<{
      _source: MediaSocialBody;
    }>;
  };
}
