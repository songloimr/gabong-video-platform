import { Role } from "../constants/role.enum";

export interface JwtPayload {
  sub: string;
  username: string;
  roles: Role[];
}
