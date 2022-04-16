import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MediaSocial, MediaSocialDocument } from './media_social.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TransResponse } from './media_social.type';
import { DefaultResponse } from '../response.type';
import { MediaSocialDto } from './media_social.dto';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as mongoose from 'mongoose';
import { MediaSocialBody } from './media_social-body.interface';
import { MediaSocialResponse } from './media_social-response.interface';

const xss = require('xss');

@Injectable()
export class MediaSocialService {
  private mediaSocialIndex = 'media_social';

  constructor(
    @InjectModel(MediaSocial.name)
    private mediasocialModel: Model<MediaSocialDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async registerMediaSocial(
    MediaSocialDto: MediaSocialDto,
  ): Promise<DefaultResponse> {
    let { name } = MediaSocialDto;
    name = xss(name.trim());
    const isExist = await this.mediasocialModel.findOne({ name: name }).exec();
    if (isExist) {
      throw new ConflictException('name has already registered');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const mediaSocialId = uuid();

      await this.mediasocialModel.create({ id: mediaSocialId, name: name });

      await this.elasticsearchService.index<MediaSocialBody>({
        index: this.mediaSocialIndex,
        body: {
          id: mediaSocialId,
          name: name,
        },
      });

      await session.commitTransaction();

      return {
        statusCode: 201,
        message: 'media social registered successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async updateMediaSocial(
    id: string,
    MediaSocialDto: MediaSocialDto,
  ): Promise<DefaultResponse> {
    let { name } = MediaSocialDto;
    name = xss(name.trim());
    const mediaSocial = await this.mediasocialModel.findOne({ id: id }).exec();
    if (!mediaSocial) {
      throw new NotFoundException('Media Social is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const updateMediaSocial = await this.mediasocialModel.findOneAndUpdate(
        { id: id },
        { name: name },
        { new: true },
      );
      const newMediaSocialBody: MediaSocialBody = {
        id: updateMediaSocial.id,
        name: updateMediaSocial.name.toString(),
      };
      const script = Object.entries(newMediaSocialBody).reduce(
        (result, [key, value]) => {
          return `${result} ctx._source.${key}='${value}';`;
        },
        '',
      );
      await this.elasticsearchService.updateByQuery({
        index: this.mediaSocialIndex,
        body: {
          query: {
            match: {
              id: id,
            },
          },
          script: {
            source: script,
          },
        },
      });
      await session.commitTransaction();
      return {
        statusCode: 200,
        message: 'media social updated successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async deleteMediaSocial(id: string): Promise<DefaultResponse> {
    const mediaSocial = await this.mediasocialModel.findOne({ id: id }).exec();
    if (!mediaSocial) {
      throw new NotFoundException('Media Social is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.mediasocialModel.findOneAndDelete({ id: id });
      await this.elasticsearchService.deleteByQuery({
        index: this.mediaSocialIndex,
        body: {
          query: {
            match: {
              id: id,
            },
          },
        },
      });
      await session.commitTransaction();
      return {
        statusCode: 200,
        message: 'media social deleted successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async getMediaSocials(): Promise<DefaultResponse> {
    const mediaSocials =
      await this.elasticsearchService.search<MediaSocialResponse>({
        index: this.mediaSocialIndex,
      });

    const hits = mediaSocials.hits.hits;
    return {
      statusCode: 200,
      message: JSON.stringify(hits.map((item) => item._source)),
      error: null,
    };
  }
}
