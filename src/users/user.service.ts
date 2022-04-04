import { Injectable } from '@nestjs/common';
import { UserResponse } from './user-response.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class UserService {
  private userIndex = 'users';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getUsers() {
    const users = await this.elasticsearchService.search<UserResponse>({
      index: this.userIndex,
    });

    const hits = users.hits.hits;
    return hits.map((item) => item._source);
  }
}
