import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Religion, ReligionDocument } from './religion.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DefaultResponse } from '../response.type';
import { ReligionDto } from './religion.dto';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as mongoose from 'mongoose';
import { ReligionBody } from './religion-body.interface';
import { ReligionResponse } from './religion-response.interface';

const xss = require('xss');

@Injectable()
export class ReligionService {
  private religionIndex = 'religions';

  constructor(
    @InjectModel(Religion.name) private religionModel: Model<ReligionDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async registerReligion(ReligionDto: ReligionDto): Promise<DefaultResponse> {
    let { name } = ReligionDto;
    name = xss(name.trim());
    const isExist = await this.religionModel.findOne({ name: name }).exec();
    if (isExist) {
      throw new ConflictException('religion has already registered');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const religionId = uuid();

      await this.religionModel.create({ id: religionId, name: name });

      await this.elasticsearchService.index<ReligionBody>({
        index: this.religionIndex,
        body: {
          id: religionId,
          name: name,
        },
      });

      await session.commitTransaction();

      return {
        statusCode: 201,
        message: 'religion registered successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async updateReligion(
    id: string,
    ReligionDto: ReligionDto,
  ): Promise<DefaultResponse> {
    let { name } = ReligionDto;
    name = xss(name.trim());
    const religion = await this.religionModel.findOne({ id: id }).exec();
    if (!religion) {
      throw new NotFoundException('Religion is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const updateReligion = await this.religionModel.findOneAndUpdate(
        { id: id },
        { name: name },
        { new: true },
      );
      const newReligionBody: ReligionBody = {
        id: updateReligion.id,
        name: updateReligion.name.toString(),
      };
      const script = Object.entries(newReligionBody).reduce(
        (result, [key, value]) => {
          return `${result} ctx._source.${key}='${value}';`;
        },
        '',
      );
      await this.elasticsearchService.updateByQuery({
        index: this.religionIndex,
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
        message: 'religion updated successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async deleteReligion(id: string): Promise<DefaultResponse> {
    const religion = await this.religionModel.findOne({ id: id }).exec();
    if (!religion) {
      throw new NotFoundException('Religion is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.religionModel.findOneAndDelete({ id: id });
      await this.elasticsearchService.deleteByQuery({
        index: this.religionIndex,
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
        message: 'religion deleted successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async getReligions(): Promise<DefaultResponse> {
    const religions = await this.elasticsearchService.search<ReligionResponse>({
      index: this.religionIndex,
    });

    const hits = religions.hits.hits;
    return {
      statusCode: 200,
      message: JSON.stringify(hits.map((item) => item._source)),
      error: null,
    };
  }

  async getReligionGraph() {
    const religions = await this.elasticsearchService.search<ReligionResponse>({
      index: this.religionIndex,
    });

    const hits = religions.hits.hits;
    return hits.map((item) => item._source);
  }
}
