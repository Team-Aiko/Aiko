// * why added?: simple singleton pattern
import { HttpStatus } from '@nestjs/common';
import { AikoError } from './classes';
export const success = new AikoError('OK', 200, 200000);
export const unknownError = new AikoError('unknown error', 0, 0);
export const expiredTokenError = new AikoError('access token expired', HttpStatus.FORBIDDEN, 1);
export const invalidTokenError = new AikoError('invalid access token', HttpStatus.UNAUTHORIZED, 2);
export const typeMismatchError = new AikoError('paramMismatch', 0, 3);
export const notAuthorizedUserError = new AikoError('NO_AUTHORIZATION', 0, 4);
export const notSameCompanyError = new AikoError('NOT_SAME_COMPANY_ERROR', 0, 5);
export const notSameDepartmentError = new AikoError('not appropriate department', 0, 6);
export const noCookieError = new AikoError('NO_COOKIE_ERROR', 0, 6);
