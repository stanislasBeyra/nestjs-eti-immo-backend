import { SetMetadata } from '@nestjs/common';
import { UserCategorie } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserCategorie[]) => SetMetadata(ROLES_KEY, roles); 