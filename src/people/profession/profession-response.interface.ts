import { ProfessionBody } from './profession-body.interface';

export interface ProfessionResponse {
  hits: {
    total: number;
    hits: Array<{
      _source: ProfessionBody;
    }>;
  };
}
