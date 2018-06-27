import * as _ from 'lodash';

// interfaces
import { ParsedArguments } from '../interfaces';

// this hash maps each argument key to a function
// that should be applied to the corresponding value
const keyMap = {
	start: (val: string, key: string) => numConvert(val, key),
	finish: (val: string, key: string) => numConvert(val, key),
	specifc: (val: string, key: string) => commaSplit(val, key),
	scope: (val: string, key: string) => numConvert(val, key),
	throttle: (val: string, key: string) => numConvert(val, key),

};

export const numConvert = (val: string, key: string) => {
	const num = parseInt(val.replace(/,/g, ''), 10);
	if (!Number.isInteger(num)) {
		console.error(`Value for ${key} is not an integer`);
		return 'err';
	} else {
		return num;
	}
};

// returns and array split on the commas and converted to number
export const commaSplit = (val: string, key: string) => {
	return val.split(',').map((id: string) => numConvert(id, `${key}: ${id}`));
};

// splitArg takes each input arg and splits it on '=' into { key: '', val: '' }
export const splitArg = (arg: string) => {
	if (arg.indexOf('=') === -1) {
		console.error(`Argument ${arg} is improperly formatted`);
		return { key: 'malformed', val: null };
	}
	const pair = arg.split('=');
	return { key: pair[0], val: pair[1] };
};

// controller manages the parsing of each argument
export const controller = (result: ParsedArguments, arg: string) => {
	const { key, val } = splitArg(arg);
	if (!result.isSuccessful || !keyMap[key]) {
		result.isSuccessful = false;
	} else {
		result.payload[key] = keyMap[key](val, key);
		result.isSuccessful = result.payload[key] !== 'err';
	}
	return result;
};

export default (args: Array<string>) => args.reduce(controller, { isSuccessful: true, payload: { start: 0 } });
