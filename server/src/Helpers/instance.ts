// * why added?: simple singleton pattern
import { HttpStatus } from '@nestjs/common';
import { AikoError } from './classes';
export const success = new AikoError('OK', 200, 200000);
export const unknownError = new AikoError('unknown error', 0, 0);
export const expiredTokenError = new AikoError('access token expired', HttpStatus.FORBIDDEN, 1);
export const invalidTokenError = new AikoError('invalid access token', HttpStatus.UNAUTHORIZED, 2);
