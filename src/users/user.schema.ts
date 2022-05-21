import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './user-role.enum';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, unique: true })
  id: {
    type: String;
    required: [true, 'please provide an uuid'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String })
  username: {
    type: String;
    required: [true, 'please provide an username'];
    min: [4, 'Min. 4 Characters'];
    max: [20, 'Max. 20 Characters'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String, unique: true })
  email: {
    type: String;
    required: [true, 'please provide an email'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String })
  @Exclude()
  password: {
    type: String;
    required: [true, 'please provide a password'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
  };

  @Prop({ type: String })
  @Exclude()
  refresh_token: {
    type: String;
    required: [true, 'please provide a refresh_token'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
  };

  @Prop({ type: String })
  role: {
    type: String;
    required: [true, 'please provide a role'];
    enum: {
      values: UserRole;
      message: '{VALUE} is not allowed';
    };
  };

  @Prop({ type: String })
  fullname: {
    type: String;
    required: [true, 'please provide a fullname'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
  };

  @Prop({ type: String })
  phone_number: {
    type: String;
    required: [true, 'please provide a phone_number'];
    min: [8, 'Min. 4 Characters'];
    max: [20, 'Max. 20 Characters'];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
