import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User, UserDocument } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from './response.type';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../jwt/jwt-payload.interface';
import { SignInDto } from './auth-signin.dto';
import { SignUpDto } from './auth-signup.dto';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as mongoose from 'mongoose';
import { UserBody } from '../users/user-body.interface';

const xss = require('xss');

@Injectable()
export class AuthService {
  private userIndex = 'users';

  constructor(
    @InjectModel(User.name) private authModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async signUp(SignUpDto: SignUpDto): Promise<AuthResponse> {
    let {
      username,
      email,
      password,
      password_confirmation,
      role,
      fullname,
      phone_number,
    } = SignUpDto;
    username = xss(username.trim());
    email = xss(email.trim());
    password = xss(password.trim());
    password_confirmation = xss(password_confirmation.trim());
    role = xss(role.trim());
    fullname = xss(fullname.trim());
    phone_number = xss(phone_number.trim());

    if (password !== password_confirmation) {
      throw new ConflictException(
        'password and password confirmation are not match',
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userIsExist = await this.authModel
      .findOne({
        $or: [{ email: email }, { username: username }],
      })
      .exec();

    if (userIsExist) {
      throw new ConflictException('username or email has already registered');
    }

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const userId = uuid();
      const payload: JwtPayload = { username, email, role };
      const accessToken: string = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRED'),
      });
      const refreshToken: string = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRED'),
      });
      const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

      await this.authModel.create({
        id: userId,
        username: username,
        email: email,
        password: hashedPassword,
        refresh_token: hashedRefreshToken,
        role: role,
        fullname: fullname,
        phone_number: phone_number,
      });

      await this.elasticsearchService.index<UserBody>({
        index: this.userIndex,
        body: {
          id: userId,
          username: username,
          email: email,
          password: hashedPassword,
          refresh_token: hashedRefreshToken,
          role: role,
          fullname: fullname,
          phone_number: phone_number,
        },
      });

      await session.commitTransaction();

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Something went wrong');
    } finally {
      session.endSession();
    }
  }

  async signIn(SignInDto: SignInDto): Promise<AuthResponse> {
    const { username, password } = SignInDto;
    const user = await this.authModel
      .findOne({
        username: username,
      })
      .exec();
    const salt = await bcrypt.genSalt();
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        username: user.username.toString(),
        email: user.email.toString(),
        role: user.role.toString(),
      };
      const accessToken: string = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRED'),
      });
      const refreshToken: string = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRED'),
      });
      const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

      try {
        await this.authModel.findOneAndUpdate(
          { username: username },
          {
            refresh_token: hashedRefreshToken,
          },
          { new: true },
        );
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
      } catch (error) {
        throw new NotFoundException('username or password is incorrect');
      }
    } else {
      throw new NotFoundException('username or password is incorrect');
    }
  }

  async refreshToken(user): Promise<AuthResponse> {
    const activeUser = await this.authModel
      .findOne({
        username: user.username,
      })
      .exec();
    const salt = await bcrypt.genSalt();
    if (
      activeUser &&
      (await bcrypt.compare(user.refreshToken, activeUser.refresh_token))
    ) {
      const payload: JwtPayload = {
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const accessToken: string = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRED'),
      });
      const refreshToken: string = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRED'),
      });
      const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

      try {
        await this.authModel.updateOne({ refresh_token: hashedRefreshToken });
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
      } catch (error) {
        throw new NotFoundException('username or password is incorrect');
      }
    } else {
      throw new NotFoundException('username or password is incorrect');
    }
  }
}
