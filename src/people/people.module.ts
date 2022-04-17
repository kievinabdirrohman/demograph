import { Module, CacheModule } from '@nestjs/common';
import { ReligionService } from './religion/religion.service';
import { ReligionController } from './religion/religion.controller';
import { ProfessionService } from './profession/profession.service';
import { ProfessionController } from './profession/profession.controller';
import { MediaSocialService } from './media_social/media_social.service';
import { MediaSocialController } from './media_social/media_social.controller';
import { PeopleService } from './people/people.service';
import { PeopleController } from './people/people.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Religion, ReligionSchema } from './religion/religion.schema';
import { Profession, ProfessionSchema } from './profession/profession.schema';
import {
  MediaSocial,
  MediaSocialSchema,
} from './media_social/media_social.schema';
import { People, PeopleSchema } from './people/people.schema';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PeopleResolver } from './people/people.resolver';
import { MediaSocialResolver } from './media_social/media_social.resolver';
import { ProfessionResolver } from './profession/profession.resolver';
import { ReligionResolver } from './religion/religion.resolver';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
    MongooseModule.forFeature([
      { name: Religion.name, schema: ReligionSchema },
      { name: Profession.name, schema: ProfessionSchema },
      { name: MediaSocial.name, schema: MediaSocialSchema },
      { name: People.name, schema: PeopleSchema },
    ]),
    AuthModule,
  ],
  controllers: [
    ReligionController,
    ProfessionController,
    MediaSocialController,
    PeopleController,
  ],
  providers: [
    ReligionService,
    ProfessionService,
    MediaSocialService,
    PeopleService,
    PeopleResolver,
    MediaSocialResolver,
    ProfessionResolver,
    ReligionResolver,
  ],
})
export class PeopleModule {}
