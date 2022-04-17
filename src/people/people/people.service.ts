import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { People, PeopleDocument } from './people.schema';
import { Religion, ReligionDocument } from '../religion/religion.schema';
import {
  Profession,
  ProfessionDocument,
} from '../profession/profession.schema';
import {
  MediaSocial,
  MediaSocialDocument,
} from '../media_social/media_social.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DefaultResponse } from '../response.type';
import { PeopleDto } from './people.dto';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as mongoose from 'mongoose';
import { PeopleBody } from './people-body.interface';
import { PeopleResponse } from './people-response.interface';

const xss = require('xss');

@Injectable()
export class PeopleService {
  private peopleIndex = 'people';

  constructor(
    @InjectModel(People.name) private peopleModel: Model<PeopleDocument>,
    @InjectModel(Religion.name) private religionModel: Model<ReligionDocument>,
    @InjectModel(Profession.name)
    private professionModel: Model<ProfessionDocument>,
    @InjectModel(MediaSocial.name)
    private mediaSocialModel: Model<MediaSocialDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async registerPeople(peopleDto: PeopleDto): Promise<DefaultResponse> {
    let {
      pid,
      fullname,
      gender,
      place_of_birth,
      date_of_birth,
      address,
      is_married,
      is_alive,
      has_driver_license,
      has_insurance,
      has_passport,
      religionId,
      professionId,
      mediaSocialId,
    } = peopleDto;

    pid = xss(pid.trim());
    fullname = xss(fullname.trim());
    gender = xss(gender.trim());
    place_of_birth = xss(place_of_birth.trim());
    date_of_birth = xss(date_of_birth);
    is_married = xss(is_married);
    is_alive = xss(is_alive);
    has_driver_license = xss(has_driver_license);
    has_insurance = xss(has_insurance);
    has_passport = xss(has_passport);

    const isExist = await this.peopleModel.findOne({ pid: pid }).exec();
    if (isExist) {
      throw new ConflictException('people has already registered');
    }

    const dataReligion = await this.religionModel
      .findOne({ id: religionId })
      .exec();
    if (!dataReligion) {
      throw new NotFoundException('religion is not found');
    }

    const dataProfession = await this.professionModel
      .findOne({ id: professionId })
      .exec();
    if (!dataProfession) {
      throw new NotFoundException('profession is not found');
    }

    const dataMediaSocial = await this.mediaSocialModel
      .where('id')
      .in(mediaSocialId)
      .exec();
    if (!dataMediaSocial) {
      throw new NotFoundException('media social is not found');
    }

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const peopleId = uuid();

      await this.peopleModel.create({
        id: peopleId,
        pid: pid,
        fullname: fullname,
        gender: gender,
        place_of_birth: place_of_birth,
        date_of_birth: date_of_birth,
        address: address,
        religion: dataReligion,
        profession: dataProfession,
        media_social: dataMediaSocial,
        is_married: is_married,
        is_alive: is_alive,
        has_driver_license: has_driver_license,
        has_insurance: has_insurance,
        has_passport: has_passport,
      });

      await this.elasticsearchService.index<PeopleBody>({
        index: this.peopleIndex,
        body: {
          id: peopleId,
          pid: pid,
          fullname: fullname,
          gender: gender,
          place_of_birth: place_of_birth,
          date_of_birth: date_of_birth,
          address: address,
          religion: Array(dataReligion),
          profession: Array(dataProfession),
          media_social: dataMediaSocial,
          is_married: is_married,
          is_alive: is_alive,
          has_driver_license: has_driver_license,
          has_insurance: has_insurance,
          has_passport: has_passport,
        },
      });

      await session.commitTransaction();

      return {
        statusCode: 201,
        message: 'people registered successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async updatePeople(
    id: string,
    peopleDto: PeopleDto,
  ): Promise<DefaultResponse> {
    let {
      pid,
      fullname,
      gender,
      place_of_birth,
      date_of_birth,
      address,
      is_married,
      is_alive,
      has_driver_license,
      has_insurance,
      has_passport,
      religionId,
      professionId,
      mediaSocialId,
    } = peopleDto;

    pid = xss(pid.trim());
    fullname = xss(fullname.trim());
    gender = xss(gender.trim());
    place_of_birth = xss(place_of_birth.trim());
    date_of_birth = xss(date_of_birth);
    is_married = xss(is_married);
    is_alive = xss(is_alive);
    has_driver_license = xss(has_driver_license);
    has_insurance = xss(has_insurance);
    has_passport = xss(has_passport);

    const isExist = await this.peopleModel.findOne({ id: id }).exec();
    if (!isExist) {
      throw new NotFoundException('people is not found');
    }

    const dataReligion = await this.religionModel
      .findOne({ id: religionId })
      .exec();
    if (!dataReligion) {
      throw new NotFoundException('religion is not found');
    }

    const dataProfession = await this.professionModel
      .findOne({ id: professionId })
      .exec();
    if (!dataProfession) {
      throw new NotFoundException('profession is not found');
    }

    const dataMediaSocial = await this.mediaSocialModel
      .where('id')
      .in(mediaSocialId)
      .exec();
    if (!dataMediaSocial) {
      throw new NotFoundException('media social is not found');
    }

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.peopleModel.findOneAndUpdate(
        { id: id },
        {
          pid: pid,
          fullname: fullname,
          gender: gender,
          place_of_birth: place_of_birth,
          date_of_birth: date_of_birth,
          address: address,
          religion: Array(dataReligion),
          profession: Array(dataProfession),
          media_social: dataMediaSocial,
          is_married: is_married,
          is_alive: is_alive,
          has_driver_license: has_driver_license,
          has_insurance: has_insurance,
          has_passport: has_passport,
        },
        { new: true },
      );

      //Updating Relationship Data on Elasticsearch is Tricky, Especially Many-to-Many Relationship
      //So, I use simple approach
      //First, Delete Index with id
      //Then, Create Index again using new Data
      await this.elasticsearchService.deleteByQuery({
        index: this.peopleIndex,
        body: {
          query: {
            match: {
              id: id,
            },
          },
        },
      });

      await this.elasticsearchService.index<PeopleBody>({
        index: this.peopleIndex,
        body: {
          id: id,
          pid: pid,
          fullname: fullname,
          gender: gender,
          place_of_birth: place_of_birth,
          date_of_birth: date_of_birth,
          address: address,
          religion: dataReligion,
          profession: dataProfession,
          media_social: dataMediaSocial,
          is_married: is_married,
          is_alive: is_alive,
          has_driver_license: has_driver_license,
          has_insurance: has_insurance,
          has_passport: has_passport,
        },
      });
      //End Elasticsearch Update

      await session.commitTransaction();
      return {
        statusCode: 200,
        message: 'people updated successfully',
        error: null,
      };
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async deletePeople(id: string): Promise<DefaultResponse> {
    const people = await this.peopleModel.findOne({ id: id }).exec();
    if (!people) {
      throw new NotFoundException('people is not found!');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.peopleModel.findOneAndDelete({ id: id });
      await this.elasticsearchService.deleteByQuery({
        index: this.peopleIndex,
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
        message: 'people deleted successfully',
        error: null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async getPeoples(): Promise<DefaultResponse> {
    const peoples = await this.elasticsearchService.search<PeopleResponse>({
      index: this.peopleIndex,
    });

    const hits = peoples.hits.hits;
    return {
      statusCode: 200,
      message: JSON.stringify(hits.map((item) => item._source)),
      error: null,
    };
  }

  async getPeopleGraph() {
    const peoples = await this.elasticsearchService.search<PeopleResponse>({
      index: this.peopleIndex,
    });

    const hits = peoples.hits.hits;
    return hits.map((item) => item._source);
  }
}
