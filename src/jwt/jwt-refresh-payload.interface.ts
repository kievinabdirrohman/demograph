export interface JwtRefreshPayload {
  username: string;
  email: string;
  role: string;
  refreshToken: string;
}
