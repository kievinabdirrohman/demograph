import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Profession, ProfessionDocument } from './profession.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TransResponse } from './response.type';
import { DefaultResponse } from '../response.type';
import { ProfessionDto } from './profession.dto';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as mongoose from 'mongoose';
import { ProfessionBody } from './profession-body.interface';
import { ProfessionResponse } from './profession-response.interface';

const xss = require('xss');

@Injectable()
export class ProfessionService {
  private professionIndex = 'profession';

  constructor(
    @InjectModel(Profession.name)
    private professionModel: Model<ProfessionDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async registerProfession(
    ProfessionDto: ProfessionDto,
  ): Promise<DefaultResponse> {
    let { name } = ProfessionDto;
    name = xss(name.trim());
    const isExist = await this.professionModel.findOne({ name: name }).exec();
    if (isExist) {
      throw new ConflictException('name has already registered');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const professionId = uuid();

      await this.professionModel.create({ id: professionId, name: name });

      await this.elasticsearchService.index<ProfessionBody>({
        index: this.professionIndex,
        body: {
          id: professionId,
          name: name,
        },
      });

      await session.commitTransaction();

      return {
        statusCode: 201,
        message: 'profession registered successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async updateProfession(
    id: string,
    ProfessionDto: ProfessionDto,
  ): Promise<DefaultResponse> {
    let { name } = ProfessionDto;
    name = xss(name.trim());
    const profession = await this.professionModel.findOne({ id: id }).exec();
    if (!profession) {
      throw new NotFoundException('Profession is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const updateProfession = await this.professionModel.findOneAndUpdate(
        { id: id },
        { name: name },
        { new: true },
      );
      const newProfessionBody: ProfessionBody = {
        id: updateProfession.id,
        name: updateProfession.name.toString(),
      };
      const script = Object.entries(newProfessionBody).reduce(
        (result, [key, value]) => {
          return `${result} ctx._source.${key}='${value}';`;
        },
        '',
      );
      await this.elasticsearchService.updateByQuery({
        index: this.professionIndex,
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
        message: 'profession updated successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async deleteProfession(id: string): Promise<DefaultResponse> {
    const profession = await this.professionModel.findOne({ id: id }).exec();
    if (!profession) {
      throw new NotFoundException('Profession is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.professionModel.findOneAndDelete({ id: id });
      await this.elasticsearchService.deleteByQuery({
        index: this.professionIndex,
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
        message: 'profession deleted successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async getProfessions(): Promise<DefaultResponse> {
    const profession =
      await this.elasticsearchService.search<ProfessionResponse>({
        index: this.professionIndex,
      });

    const hits = profession.hits.hits;
    return {
      statusCode: 200,
      message: JSON.stringify(hits.map((item) => item._source)),
      error: null,
    };
  }
}
