// * why added?: simple singleton pattern
import { AikoError } from './classes';
export const success = new AikoError('OK', 200, 200000);
