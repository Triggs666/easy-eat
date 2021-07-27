/**
 * A payload of a JWT token
 */
export interface JwtPayload {
  name: string
  nickname:string
  iss: string
  sub: string
  iat: number
  exp: number
}
