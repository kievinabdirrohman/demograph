import { UserBody } from './user-body.interface';

export interface UserResponse {
  hits: {
    total: number;
    hits: Array<{
      _source: UserBody;
    }>;
  };
}