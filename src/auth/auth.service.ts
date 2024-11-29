import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { instanceToInstance } from 'class-transformer';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';

import { UserEntity } from '@/users/entities/user.entity';

import { GoogleLoginDto, VerifyEmailDto } from './dto';

@Injectable()
export class AuthService {
  private logger: Logger;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private datasource: DataSource,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByParams({
      email,
      isActive: true,
    });
    if (!user.password) {
      throw new BadRequestException('You must set a password for your account');
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const manager = queryRunner.manager;
      const normUser: UserEntity = user.user ? user.user : user;

      if (!normUser.emailVerified) {
        throw new BadRequestException('Email not confirmed!');
      }
      normUser.isLoggedIn = true;
      normUser.updatedAt = new Date().toISOString();

      const savedUser = await this.usersService.saveUser(normUser, manager);

      const session = await this.usersService.createSession(savedUser, manager);

      await queryRunner.commitTransaction();

      const { accessToken, refreshToken } = await this.generateTokens(
        user.email,
        user.role,
        user.id,
        session.id,
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(payload: VerifyEmailDto) {
    const { code } = payload;

    const { user, session } = await this.usersService.verifyEmail(code);

    const { accessToken, refreshToken } = await this.generateTokens(
      user.email,
      user.role,
      user.id,
      session.id,
    );
    return {
      user: instanceToInstance(user),
      accessToken,
      refreshToken,
    };
  }

  async findOrCreateFromGoogle({ email, username, picture }) {
    return await this.usersService.findOrCreateFromGoogle({
      email,
      username,
      picture,
    });
  }

  async googleLogin(payload: GoogleLoginDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const manager = queryRunner.manager;

      const { googleToken, password } = payload;
      const user = await this.usersService.findOneByParams({ googleToken });

      if (!password && !user.password) {
        throw new BadRequestException('Password is required for new users.');
      }

      if (password && !user.password) {
        user.password = await bcrypt.hash(password, 10);
      }

      user.googleToken = null;
      user.isLoggedIn = true;
      user.updatedAt = new Date().toISOString();

      await this.usersService.saveUser(user, manager);

      const session = await this.usersService.createSession(user, manager);

      const { accessToken, refreshToken } = await this.generateTokens(
        user.email,
        user.role,
        user.id,
        session.id,
      );

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateTokens(
    email: string,
    role: string,
    id: number,
    sessionId: number,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync({
        email: email,
        role: role,
        sub: id,
        sessionId: sessionId,
      }),

      await this.jwtService.signAsync(
        {
          email: email,
          role: role,
          sub: id,
          sessionId: sessionId,
        },
        {
          expiresIn: '7d',
          secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(user: any, previousRefreshToken: string) {
    const payload = await this.jwtService.verifyAsync(previousRefreshToken, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
    });

    const now = Math.floor(Date.now() / 1000);

    if (!payload) {
      throw new UnauthorizedException('invalid token');
    }

    await this.usersService.findOneForRefreshToken(payload.email);

    if (payload.exp < now) {
      await this.usersService.logout(payload.sub);
      throw new UnauthorizedException('invalid token');
    }
    const sessionId = payload.sessionId;

    const newSession = await this.usersService.findOpenedSessionAndDelete(
      sessionId,
      user.sub,
    );

    const { accessToken, refreshToken } = await this.generateTokens(
      payload.email,
      payload.role,
      payload.sub,
      newSession.id,
    );

    return { accessToken, refreshToken };
  }

  public async verifyGoogleMobileIdToken(token: string) {
    const client = new OAuth2Client();
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_MOBILE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload.');
      }
      const { email, name, picture } = payload;
      const { user, status } = await this.findOrCreateFromGoogle({
        email,
        username: name,
        picture,
      });

      return { status, googleToken: user.googleToken, userId: user.id };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error('Error verifying Google ID token: ', error);
        throw new InternalServerErrorException('An unexpected error occurred.');
      }
    }
  }
}
