import { PeopleBody } from './people-body.interface';

export interface PeopleResponse {
  hits: {
    total: number;
    hits: Array<{
      _source: PeopleBody;
    }>;
  };
}
