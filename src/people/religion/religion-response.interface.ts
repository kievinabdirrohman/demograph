import { ReligionBody } from './religion-body.interface';

export interface ReligionResponse {
  hits: {
    total: number;
    hits: Array<{
      _source: ReligionBody;
    }>;
  };
}
