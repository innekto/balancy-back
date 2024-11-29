import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request as req, Response } from 'express';
import {
  ApiCustomResponse,
  Public,
  setRefreshTokenCookie,
  User,
} from 'src/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

import responses from '../responses.json';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  GoogleLoginDto,
  LoginUserDto,
  LoginUserResponseDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyGoogleMobileIdTokenDto,
} from './dto';
import { ResetCodeDto } from './dto/reset-code.dto';
import { RefreshJwtAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ type: LoginUserResponseDto })
  @ApiOperation({
    summary: 'user login',
  })
  @Post('login')
  async login(
    @User() user: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(user);

    setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'user registration (send token to email for verification)',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.userRegisterResponse)
  async register(@Body() createUserDto: CreateUserDto) {
    const { user } = await this.usersService.create(createUserDto);

    return user;
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'open google auth window',
  })
  googleAuth() {
    // initiates the Google OAuth2 login flow
  }

  @Public()
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'redirect to the required page',
  })
  async googleAuthRedirect(
    @Request() request: req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user as any;
    const status = user.status;
    const redirectUrl =
      status === 'new'
        ? `${process.env.CLIENT_URL}/auth/google-set-password/?code=${user.userInDb.googleToken}`
        : `${process.env.CLIENT_URL}/auth/login/?code=${user.userInDb.googleToken}`;

    response.redirect(redirectUrl);
  }

  @Public()
  @Post('google/login')
  @ApiOperation({
    summary:
      'login after choosing google account, password is optional(required only for new user)',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.accessToken)
  async googleLogin(
    @Body() payload: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.googleLogin(
      payload,
    );

    setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @Public()
  @Post('verify-google-mobile-id-token')
  @ApiOperation({
    summary: 'verify google user id token and if token validate authorize user',
  })
  @ApiCustomResponse(
    HttpStatus.CREATED,
    { googleToken: responses.accessToken },
    'Returns when user authorize for the first time (after this he need to set password)',
  )
  @ApiCustomResponse(HttpStatus.OK, responses.accessToken)
  async verifyGoogleMobileIdToken(
    @Body() { token }: VerifyGoogleMobileIdTokenDto,
  ) {
    const { googleToken, status } =
      await this.authService.verifyGoogleMobileIdToken(token);

    return {
      status: status === 'new' ? HttpStatus.CREATED : HttpStatus.OK,
      googleToken,
    };
  }

  @Public()
  @Patch('verify-email')
  @ApiOperation({
    summary: 'email verification',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.verifiedUser)
  async verifyEmail(
    @Body() payload: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
    @Request() request: req,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.verifyEmail(payload);

    setRefreshTokenCookie(response, refreshToken);

    return { user, accessToken };
  }

  @Public()
  @Patch('resend-email-verification')
  @ApiCustomResponse(HttpStatus.OK, responses.userRegisterResponse)
  resendEmailVerification(@Body() resendDto: ResendVerificationDto) {
    return this.usersService.resendEmailVerification(resendDto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'sends reset password token to email',
  })
  async requestPasswordReset(@Body() payload: ResetPasswordDto) {
    return this.usersService.resetPassword(payload);
  }

  @Public()
  @Post('verify-reset-code')
  @ApiOperation({
    summary: 'password reset code verification, only for apps!',
  })
  async verifyResetCode(@Body() payload: ResetCodeDto) {
    return this.usersService.verifyResetCode(payload.resetCode);
  }

  @Public()
  @ApiCustomResponse(HttpStatus.CREATED, responses.accessToken)
  @ApiOperation({
    summary: 'set new password (email for apps, token for web)',
  })
  @Post('set-password')
  async verifyPasswordReset(
    @Body() body: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
    @Request() request: req,
  ) {
    const user = await this.usersService.setPassword(body);
    const { accessToken, refreshToken } = await this.authService.login(user);

    setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @Public()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh-token')
  @ApiOperation({
    summary: 'generate new tokens',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.accessToken)
  async refreshToken(
    @Request() request: req,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!request.headers.cookie)
      throw new BadRequestException('Cookie is required!');

    const existingRefreshToken = request.headers.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('refresh_token='))
      ?.split('=')[1];

    const { accessToken, refreshToken } = await this.authService.refreshToken(
      request.user,
      existingRefreshToken,
    );

    setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }
}
