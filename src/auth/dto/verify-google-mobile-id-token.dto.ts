import { IsJWT, IsNotEmpty } from 'class-validator';

export class VerifyGoogleMobileIdTokenDto {
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
