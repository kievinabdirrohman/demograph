import { Module, CacheModule } from '@nestjs/common';
import { ReligionService } from './religion/religion.service';
import { ReligionController } from './religion/religion.controller';
import { ProfessionService } from './profession/profession.service';
import { ProfessionController } from './profession/profession.controller';
import { MediaSocialService } from './media_social/media_social.service';
import { MediaSocialController } from './media_social/media_social.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Religion, ReligionSchema } from './religion/religion.schema';
import { Profession, ProfessionSchema } from './profession/profession.schema';
import { MediaSocial, MediaSocialSchema } from './media_social/media_social.schema';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    ]),
    AuthModule,
  ],
  controllers: [ReligionController, ProfessionController, MediaSocialController],
  providers: [ReligionService, ProfessionService, MediaSocialService],
})
export class PeopleModule {}
