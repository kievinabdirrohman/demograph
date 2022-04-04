import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './user-role.enum';

export type UserDocument = User & Document;

@Schema()
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

  @Prop({ type: String })
  email: {
    type: String;
    required: [true, 'please provide an email'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String })
  password: {
    type: String;
    required: [true, 'please provide a password'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
  };

  @Prop({ type: String })
  refresh_token: {
    type: String;
    required: [true, 'please provide a refresh_token'];
    min: [4, 'Min. 4 Characters'];
    max: [255, 'Max. 255 Characters'];
  };

  @Prop({ type: String })
  role: {
    type: String;
    required: [true, 'please provide a password'];
    enum: {
      values: UserRole;
      message: '{VALUE} is not supported';
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
