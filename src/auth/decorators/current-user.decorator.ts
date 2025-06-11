import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  id: number;
  email: string;
  role?: string;
}

export const GetCurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext): CurrentUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);