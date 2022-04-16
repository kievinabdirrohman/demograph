import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { PeopleGender } from './people-gender.enum';
import { Religion } from '../religion/religion.schema';
import { Profession } from '../profession/profession.schema';
import { MediaSocial } from '../media_social/media_social.schema';
import { Type } from 'class-transformer';

export type PeopleDocument = People & Document;

@Schema({ timestamps: true })
export class People {
  @Prop({ type: String, unique: true })
  id: {
    type: String;
    required: [true, 'please provide an uuid'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String, unique: true })
  pid: {
    type: String;
    required: [true, 'please provide an pid'];
    min: [16, 'Min. 16 Characters'];
    max: [16, 'Max. 16 Characters'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String })
  fullname: {
    type: String;
    required: [true, 'please provide an fullname'];
    min: [3, 'Min. 3 Characters'];
    max: [20, 'Max. 20 Characters'];
  };

  @Prop({ type: String })
  gender: {
    type: String;
    required: [true, 'please provide an gender'];
    enum: {
      values: PeopleGender;
      message: '{VALUE} is not allowed';
    };
  };

  @Prop({ type: String })
  place_of_birth: {
    type: String;
    required: [true, 'please provide an place_of_birth'];
    min: [3, 'Min. 3 Characters'];
    max: [100, 'Max. 100 Characters'];
  };

  @Prop({ type: Date })
  date_of_birth: {
    type: Date;
    required: [true, 'please provide an date_of_birth'];
  };

  @Prop({ type: String })
  address: {
    type: String;
    required: [true, 'please provide an address'];
    min: [5, 'Min. 5 Characters'];
    max: [255, 'Max. 255 Characters'];
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Religion.name })
  @Type(() => Religion)
  religion: Religion;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Profession.name })
  @Type(() => Profession)
  profession: Profession;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: MediaSocial.name }],
  })
  @Type(() => MediaSocial)
  media_social: MediaSocial;

  @Prop({ type: Boolean, default: false })
  is_married: {
    type: Boolean;
    required: [true, 'please provide an is_married'];
  };

  @Prop({ type: Boolean, default: true })
  is_alive: {
    type: Boolean;
    required: [true, 'please provide an is_alive'];
  };

  @Prop({ type: Boolean, default: true })
  has_driver_license: {
    type: Boolean;
    required: [true, 'please provide an has_driver_license'];
  };

  @Prop({ type: Boolean, default: true })
  has_insurance: {
    type: Boolean;
    required: [true, 'please provide an has_insurance'];
  };

  @Prop({ type: Boolean, default: false })
  has_passport: {
    type: Boolean;
    required: [true, 'please provide an has_passport'];
  };
}

export const PeopleSchema = SchemaFactory.createForClass(People);
