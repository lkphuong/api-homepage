import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: 'language', ctx: ExecutionContext) => {
    console.log('data: ', data);
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request?.cookies?.language;
  },
);
