// interfaces
import { Payload } from '../interfaces';

export const getFinish = (payload: Payload, range: number) => payload.finish ? payload.finish : payload.start + range;

export default (payload: Payload, range: number) => {
	const finish: number = getFinish(payload, range);
	return { start: payload.start, finish };
}