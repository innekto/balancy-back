export interface JwtPayload {
  email: string;
  role: string;
  sub: number;
  iat: number;
  exp: number;
  sessionId: number;
}

export interface JwtRefreshPayload extends JwtPayload {
  username: string;
}
