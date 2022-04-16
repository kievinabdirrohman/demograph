import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReligionDocument = Religion & Document;

@Schema({ timestamps: true })
export class Religion {
  @Prop({ type: String, unique: true })
  id: {
    type: String;
    required: [true, 'please provide an uuid'];
    unique: [true, '{VALUE} has already registered'];
  };

  @Prop({ type: String, unique: true })
  name: {
    type: String;
    required: [true, 'please provide an name'];
    min: [3, 'Min. 3 Characters'];
    max: [20, 'Max. 20 Characters'];
    unique: [true, '{VALUE} has already registered'];
  };
}

export const ReligionSchema = SchemaFactory.createForClass(Religion);
